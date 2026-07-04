alter table public.profiles enable row level security;

-- Own profile or admin can read any profile
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

-- Public can read profiles that belong to a doctor (needed for booking page join)
drop policy if exists "profiles_select_doctor_public" on public.profiles;
create policy "profiles_select_doctor_public"
on public.profiles for select
using (
  exists (select 1 from public.doctors d where d.profile_id = id)
);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());
