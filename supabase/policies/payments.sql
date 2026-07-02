alter table public.payments enable row level security;

drop policy if exists "payments_select_participant_or_admin" on public.payments;
create policy "payments_select_participant_or_admin"
on public.payments for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.appointments a
    join public.patients p on p.id = a.patient_id
    where a.id = appointment_id and p.profile_id = auth.uid()
  )
  or exists (
    select 1
    from public.appointments a
    join public.doctors d on d.id = a.doctor_id
    where a.id = appointment_id and d.profile_id = auth.uid()
  )
);

drop policy if exists "payments_insert_patient_own" on public.payments;
create policy "payments_insert_patient_own"
on public.payments for insert
with check (
  exists (
    select 1
    from public.appointments a
    join public.patients p on p.id = a.patient_id
    where a.id = appointment_id and p.profile_id = auth.uid()
  )
);

drop policy if exists "payments_update_admin_only" on public.payments;
create policy "payments_update_admin_only"
on public.payments for update
using (public.is_admin())
with check (public.is_admin());

