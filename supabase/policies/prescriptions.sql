alter table public.prescriptions enable row level security;

drop policy if exists "prescriptions_select_participant_or_admin" on public.prescriptions;
create policy "prescriptions_select_participant_or_admin"
on public.prescriptions for select
using (
  public.is_admin()
  or exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid())
  or exists (select 1 from public.doctors d where d.id = doctor_id and d.profile_id = auth.uid())
);

drop policy if exists "prescriptions_insert_doctor_own" on public.prescriptions;
create policy "prescriptions_insert_doctor_own"
on public.prescriptions for insert
with check (exists (select 1 from public.doctors d where d.id = doctor_id and d.profile_id = auth.uid()));

