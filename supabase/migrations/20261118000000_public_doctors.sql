-- Public doctor directory, secure profile creation, and doctor approval.
-- Safe to run repeatedly in Supabase SQL Editor.

alter table public.doctors
  alter column verified set default false;

-- Keep existing doctors visible once; later re-runs must not approve new applications.
create table if not exists public.healpoint_migration_markers (
  key text primary key,
  applied_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from public.healpoint_migration_markers where key = 'public_doctors_backfill_v1') then
    update public.doctors set verified = true where verified = false;
    insert into public.healpoint_migration_markers (key) values ('public_doctors_backfill_v1');
  end if;
end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'HealPoint user'),
    case when new.raw_user_meta_data->>'role' = 'doctor' then 'doctor' else 'patient' end,
    nullif(trim(new.raw_user_meta_data->>'avatar_url'), '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

create or replace function public.handle_new_doctor_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_meta jsonb;
begin
  if new.role = 'doctor' then
    select raw_user_meta_data into v_meta from auth.users where id = new.id;
    insert into public.doctors (profile_id, specialty, bio, consultation_fee, verified, rating)
    values (
      new.id,
      coalesce(nullif(trim(v_meta->>'specialty'), ''), 'General Practice'),
      nullif(trim(v_meta->>'bio'), ''),
      greatest(coalesce(nullif(v_meta->>'consultation_fee_paise', '')::integer, 0), 0),
      false,
      0
    )
    on conflict (profile_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_doctor_profile_created on public.profiles;
create trigger on_doctor_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_doctor_profile();

-- The view exposes only fields intended for the public directory.
create or replace view public.public_doctors
with (security_invoker = false)
as
select
  d.id,
  p.full_name,
  p.avatar_url,
  d.specialty,
  d.bio,
  d.rating,
  d.consultation_fee,
  d.created_at
from public.doctors d
join public.profiles p on p.id = d.profile_id
where d.verified = true and p.is_active = true;

grant select on public.public_doctors to anon, authenticated;

alter table public.doctors enable row level security;
drop policy if exists "doctors_select_all" on public.doctors;
drop policy if exists "doctors_select_verified_or_self_or_admin" on public.doctors;
create policy "doctors_select_verified_or_self_or_admin"
on public.doctors for select
using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "doctors_update_self_or_admin" on public.doctors;
create policy "doctors_update_self_or_admin"
on public.doctors for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

-- Direct public profile reads are removed; use public.public_doctors instead.
drop policy if exists "profiles_select_doctor_public" on public.profiles;
