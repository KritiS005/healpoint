-- ============================================================
-- Trigger: auto-create doctors row when a doctor profile is inserted.
-- Runs inside the DB transaction — fully independent of the app layer.
-- Reads specialty/bio/fee from auth.users raw_user_meta_data so the
-- doctor's chosen values are preserved, not overwritten with defaults.
-- ============================================================

create or replace function public.handle_new_doctor_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_meta        jsonb;
  v_specialty   text;
  v_bio         text;
  v_fee         integer;
begin
  if new.role = 'doctor' then
    -- Read metadata stored at signup time from auth.users
    select raw_user_meta_data
      into v_meta
      from auth.users
     where id = new.id;

    v_specialty := coalesce(v_meta->>'specialty', 'General Practice');
    v_bio       := coalesce(v_meta->>'bio', '');
    v_fee       := coalesce((v_meta->>'consultation_fee_paise')::integer, 0);

    insert into public.doctors (
      profile_id,
      specialty,
      bio,
      consultation_fee,
      verified,
      rating
    )
    values (
      new.id,
      v_specialty,
      v_bio,
      v_fee,
      true,
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
  for each row
  execute function public.handle_new_doctor_profile();
