create table if not exists public.pbos_conversations (
  id uuid primary key default gen_random_uuid(), scholar_id uuid not null, relationship_id uuid not null unique references public.support_relationships(id),
  status text not null default 'ACTIVE' check (status in ('ACTIVE','ARCHIVED')), created_by uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.pbos_conversation_participants (
  conversation_id uuid not null references public.pbos_conversations(id) on delete cascade, user_id uuid not null, role text not null,
  muted_at timestamptz, blocked_at timestamptz, last_read_at timestamptz, primary key (conversation_id,user_id)
);
create table if not exists public.pbos_messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.pbos_conversations(id) on delete cascade,
  scholar_id uuid not null, sender_id uuid not null, body text not null check (char_length(body) between 1 and 2000),
  idempotency_key text not null unique, delivery_state text not null default 'PENDING' check (delivery_state in ('PENDING','DELIVERED','FAILED')),
  moderation_state text not null default 'VISIBLE' check (moderation_state in ('VISIBLE','REPORTED','HIDDEN')),
  reported_at timestamptz, provenance jsonb not null default '[]'::jsonb, created_at timestamptz not null default now()
);
create index if not exists pbos_messages_conversation_created_idx on public.pbos_messages(conversation_id,created_at);
alter table public.pbos_conversations enable row level security;
alter table public.pbos_conversation_participants enable row level security;
alter table public.pbos_messages enable row level security;
drop policy if exists "Governed participants view conversations" on public.pbos_conversations;
create policy "Governed participants view conversations" on public.pbos_conversations for select to authenticated using (
  scholar_id = auth.uid() or exists (select 1 from public.support_relationships r where r.id=relationship_id and r.status='active' and r.supporter_id=auth.uid()));
drop policy if exists "Governed actors create conversations" on public.pbos_conversations;
create policy "Governed actors create conversations" on public.pbos_conversations for insert to authenticated with check (
  created_by=auth.uid() and (scholar_id = auth.uid() or exists (select 1 from public.support_relationships r
    where r.id=relationship_id and r.status='active' and r.supporter_id=auth.uid())));
drop policy if exists "Participants view their state" on public.pbos_conversation_participants;
create policy "Participants view their state" on public.pbos_conversation_participants for select to authenticated using (user_id=auth.uid());
drop policy if exists "Authorized actors join conversations" on public.pbos_conversation_participants;
create policy "Authorized actors join conversations" on public.pbos_conversation_participants for insert to authenticated with check (
  user_id=auth.uid() and exists (select 1 from public.pbos_conversations c join public.support_relationships r on r.id=c.relationship_id
    where c.id=conversation_id and r.status='active' and (c.scholar_id=auth.uid() or r.supporter_id=auth.uid())));
drop policy if exists "Participants update their state" on public.pbos_conversation_participants;
create policy "Participants update their state" on public.pbos_conversation_participants for update to authenticated
  using (user_id=auth.uid()) with check (user_id=auth.uid());
drop policy if exists "Governed participants view messages" on public.pbos_messages;
create policy "Governed participants view messages" on public.pbos_messages for select to authenticated using (
  scholar_id=auth.uid() or exists (select 1 from public.pbos_conversation_participants p where p.conversation_id=pbos_messages.conversation_id and p.user_id=auth.uid()));
drop policy if exists "Governed participants send messages" on public.pbos_messages;
create policy "Governed participants send messages" on public.pbos_messages for insert to authenticated with check (sender_id=auth.uid() and
  scholar_id=(select c.scholar_id from public.pbos_conversations c where c.id=pbos_messages.conversation_id) and
  exists (select 1 from public.pbos_conversation_participants p where p.conversation_id=pbos_messages.conversation_id and p.user_id=auth.uid() and p.blocked_at is null));
drop policy if exists "Governed participants update messages" on public.pbos_messages;
create policy "Governed participants update messages" on public.pbos_messages for update to authenticated using (
  sender_id=auth.uid() or exists (select 1 from public.pbos_conversation_participants p where p.conversation_id=pbos_messages.conversation_id and p.user_id=auth.uid()))
  with check (sender_id=auth.uid() or exists (select 1 from public.pbos_conversation_participants p where p.conversation_id=pbos_messages.conversation_id and p.user_id=auth.uid()));
grant select, insert on public.pbos_conversations to authenticated;
grant select, insert on public.pbos_conversation_participants to authenticated;
grant update (muted_at,blocked_at,last_read_at) on public.pbos_conversation_participants to authenticated;
grant select, insert on public.pbos_messages to authenticated;
revoke update on public.pbos_messages from authenticated;
grant update (delivery_state,moderation_state,reported_at,provenance) on public.pbos_messages to authenticated;
