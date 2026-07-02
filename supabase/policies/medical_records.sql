alter table public.medical_records enable row level security;

drop policy if exists "medical_records_select_owner_doctor_or_admin" on public.medical_records;
create policy "medical_records_select_owner_doctor_or_admin"
on public.medical_records for select
using (
  public.is_admin()
  or exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid())
  or exists (
    select 1 from public.appointments a
    join public.doctors d on d.id = a.doctor_id
    where a.patient_id = medical_records.patient_id and d.profile_id = auth.uid()
  )
);

drop policy if exists "medical_records_insert_owner" on public.medical_records;
create policy "medical_records_insert_owner"
on public.medical_records for insert
with check (exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid()));

drop policy if exists "medical_records_update_owner_or_admin" on public.medical_records;
create policy "medical_records_update_owner_or_admin"
on public.medical_records for update
using (public.is_admin() or exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid()))
with check (public.is_admin() or exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid()));

