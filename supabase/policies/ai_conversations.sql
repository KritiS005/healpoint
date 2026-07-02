alter table public.ai_conversations enable row level security;

drop policy if exists "ai_conversations_select_owner_or_admin" on public.ai_conversations;
create policy "ai_conversations_select_owner_or_admin"
on public.ai_conversations for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "ai_conversations_insert_owner" on public.ai_conversations;
create policy "ai_conversations_insert_owner"
on public.ai_conversations for insert
with check (user_id = auth.uid());

