alter table public.doctors enable row level security;

drop policy if exists "doctors_select_verified_or_self_or_admin" on public.doctors;
create policy "doctors_select_verified_or_self_or_admin"
on public.doctors for select
using (verified = true or profile_id = auth.uid() or public.is_admin());

drop policy if exists "doctors_insert_self" on public.doctors;
create policy "doctors_insert_self"
on public.doctors for insert
with check (profile_id = auth.uid() and public.current_profile_role() = 'doctor');

drop policy if exists "doctors_update_self_or_admin" on public.doctors;
create policy "doctors_update_self_or_admin"
on public.doctors for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

