alter table public.patients enable row level security;

drop policy if exists "patients_select_self_doctor_or_admin" on public.patients;
create policy "patients_select_self_doctor_or_admin"
on public.patients for select
using (
  profile_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.appointments a
    join public.doctors d on d.id = a.doctor_id
    where a.patient_id = patients.id and d.profile_id = auth.uid()
  )
);

drop policy if exists "patients_insert_self" on public.patients;
create policy "patients_insert_self"
on public.patients for insert
with check (profile_id = auth.uid() and public.current_profile_role() = 'patient');

drop policy if exists "patients_update_self_or_admin" on public.patients;
create policy "patients_update_self_or_admin"
on public.patients for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

