alter table public.call_rooms enable row level security;

drop policy if exists "call_rooms_select_participant_or_admin" on public.call_rooms;
create policy "call_rooms_select_participant_or_admin"
on public.call_rooms for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.appointments a
    left join public.patients p on p.id = a.patient_id
    left join public.doctors d on d.id = a.doctor_id
    where a.id = appointment_id and (p.profile_id = auth.uid() or d.profile_id = auth.uid())
  )
);

drop policy if exists "call_rooms_update_participant_or_admin" on public.call_rooms;
create policy "call_rooms_update_participant_or_admin"
on public.call_rooms for update
using (
  public.is_admin()
  or exists (
    select 1
    from public.appointments a
    left join public.patients p on p.id = a.patient_id
    left join public.doctors d on d.id = a.doctor_id
    where a.id = appointment_id and (p.profile_id = auth.uid() or d.profile_id = auth.uid())
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.appointments a
    left join public.patients p on p.id = a.patient_id
    left join public.doctors d on d.id = a.doctor_id
    where a.id = appointment_id and (p.profile_id = auth.uid() or d.profile_id = auth.uid())
  )
);

