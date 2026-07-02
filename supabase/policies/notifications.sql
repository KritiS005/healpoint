alter table public.notifications enable row level security;

drop policy if exists "notifications_select_owner_or_admin" on public.notifications;
create policy "notifications_select_owner_or_admin"
on public.notifications for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_update_owner_or_admin" on public.notifications;
create policy "notifications_update_owner_or_admin"
on public.notifications for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

