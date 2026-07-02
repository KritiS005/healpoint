alter table public.appointments enable row level security;

drop policy if exists "appointments_select_participant_or_admin" on public.appointments;
create policy "appointments_select_participant_or_admin"
on public.appointments for select
using (
  public.is_admin()
  or exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid())
  or exists (select 1 from public.doctors d where d.id = doctor_id and d.profile_id = auth.uid())
);

drop policy if exists "appointments_insert_patient_own" on public.appointments;
create policy "appointments_insert_patient_own"
on public.appointments for insert
with check (exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid()));

drop policy if exists "appointments_update_participant_or_admin" on public.appointments;
create policy "appointments_update_participant_or_admin"
on public.appointments for update
using (
  public.is_admin()
  or exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid())
  or exists (select 1 from public.doctors d where d.id = doctor_id and d.profile_id = auth.uid())
)
with check (
  public.is_admin()
  or exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid())
  or exists (select 1 from public.doctors d where d.id = doctor_id and d.profile_id = auth.uid())
);

