alter table public.doctors enable row level security;

-- Public can read all doctors (needed for booking page, including unauthenticated visitors)
drop policy if exists "doctors_select_verified_or_self_or_admin" on public.doctors;
create policy "doctors_select_all"
on public.doctors for select
using (true);

-- Doctor can only insert their own row; role must be doctor
drop policy if exists "doctors_insert_self" on public.doctors;
create policy "doctors_insert_self"
on public.doctors for insert
with check (profile_id = auth.uid() and public.current_profile_role() = 'doctor');

-- Doctor can update their own row; admin can update any
drop policy if exists "doctors_update_self_or_admin" on public.doctors;
create policy "doctors_update_self_or_admin"
on public.doctors for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());
