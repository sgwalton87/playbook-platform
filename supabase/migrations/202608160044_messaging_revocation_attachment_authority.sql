-- Messaging authority must fail closed when the underlying support relationship is revoked.
-- Attachments reuse the same current-relationship authority and remain private in Storage.

create or replace function private.pbos_user_has_active_conversation_access(
  p_conversation_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.pbos_conversations c
    join public.support_relationships r on r.id = c.relationship_id
    where c.id = p_conversation_id
      and c.status = 'ACTIVE'
      and r.status = 'active'
      and (
        c.scholar_id = p_user_id
        or r.supporter_id = p_user_id
        or (
          r.supporter_email is not null
          and lower(r.supporter_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
      )
  );
$$;

revoke all on function private.pbos_user_has_active_conversation_access(uuid, uuid) from public, anon, authenticated;

-- Existing conversation policies are rewritten through the same relationship-aware authority.
drop policy if exists "Governed participants view conversations" on public.pbos_conversations;
create policy "Governed participants view conversations"
on public.pbos_conversations for select to authenticated
using (private.pbos_user_has_active_conversation_access(id, auth.uid()));

drop policy if exists "Governed actors create conversations" on public.pbos_conversations;
create policy "Governed actors create conversations"
on public.pbos_conversations for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.support_relationships r
    where r.id = relationship_id
      and r.status = 'active'
      and (
        scholar_id = auth.uid()
        or r.supporter_id = auth.uid()
        or (
          r.supporter_email is not null
          and lower(r.supporter_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
      )
  )
);

-- Participant state is no longer sufficient authority after relationship revocation.
drop policy if exists "Participants view their state" on public.pbos_conversation_participants;
create policy "Participants view their state"
on public.pbos_conversation_participants for select to authenticated
using (
  user_id = auth.uid()
  and private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
);

drop policy if exists "Authorized actors join conversations" on public.pbos_conversation_participants;
create policy "Authorized actors join conversations"
on public.pbos_conversation_participants for insert to authenticated
with check (
  user_id = auth.uid()
  and private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
);

drop policy if exists "Participants update their state" on public.pbos_conversation_participants;
create policy "Participants update their state"
on public.pbos_conversation_participants for update to authenticated
using (
  user_id = auth.uid()
  and private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
)
with check (
  user_id = auth.uid()
  and private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
);

-- Message history, sending, and moderation all require current relationship authority.
drop policy if exists "Governed participants view messages" on public.pbos_messages;
create policy "Governed participants view messages"
on public.pbos_messages for select to authenticated
using (private.pbos_user_has_active_conversation_access(conversation_id, auth.uid()));

drop policy if exists "Governed participants send messages" on public.pbos_messages;
create policy "Governed participants send messages"
on public.pbos_messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and scholar_id = (select c.scholar_id from public.pbos_conversations c where c.id = pbos_messages.conversation_id)
  and private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
  and exists (
    select 1 from public.pbos_conversation_participants p
    where p.conversation_id = pbos_messages.conversation_id
      and p.user_id = auth.uid()
      and p.blocked_at is null
  )
);

drop policy if exists "Governed participants update messages" on public.pbos_messages;
create policy "Governed participants update messages"
on public.pbos_messages for update to authenticated
using (
  private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
  and (
    sender_id = auth.uid()
    or exists (
      select 1 from public.pbos_conversation_participants p
      where p.conversation_id = pbos_messages.conversation_id
        and p.user_id = auth.uid()
    )
  )
)
with check (
  private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
  and (
    sender_id = auth.uid()
    or exists (
      select 1 from public.pbos_conversation_participants p
      where p.conversation_id = pbos_messages.conversation_id
        and p.user_id = auth.uid()
    )
  )
);

create table if not exists public.pbos_message_attachments (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.pbos_conversations(id) on delete cascade,
  message_id uuid references public.pbos_messages(id) on delete cascade,
  uploader_id uuid not null,
  storage_path text not null unique,
  original_name text not null check (char_length(original_name) between 1 and 180),
  mime_type text not null check (mime_type in (
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )),
  byte_size bigint not null check (byte_size between 1 and 10485760),
  created_at timestamptz not null default now(),
  constraint pbos_message_attachment_path_scope check (
    split_part(storage_path, '/', 1) = conversation_id::text
    and split_part(storage_path, '/', 2) = uploader_id::text
  )
);

create index if not exists pbos_message_attachments_conversation_idx
  on public.pbos_message_attachments(conversation_id, created_at);
create index if not exists pbos_message_attachments_message_idx
  on public.pbos_message_attachments(message_id) where message_id is not null;

alter table public.pbos_message_attachments enable row level security;

drop policy if exists "Current participants view message attachments" on public.pbos_message_attachments;
create policy "Current participants view message attachments"
on public.pbos_message_attachments for select to authenticated
using (private.pbos_user_has_active_conversation_access(conversation_id, auth.uid()));

drop policy if exists "Current participants stage message attachments" on public.pbos_message_attachments;
create policy "Current participants stage message attachments"
on public.pbos_message_attachments for insert to authenticated
with check (
  uploader_id = auth.uid()
  and message_id is null
  and private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
);

drop policy if exists "Uploaders attach staged message attachments" on public.pbos_message_attachments;
create policy "Uploaders attach staged message attachments"
on public.pbos_message_attachments for update to authenticated
using (
  uploader_id = auth.uid()
  and message_id is null
  and private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
)
with check (
  uploader_id = auth.uid()
  and message_id is not null
  and private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
  and exists (
    select 1 from public.pbos_messages m
    where m.id = message_id
      and m.conversation_id = pbos_message_attachments.conversation_id
      and m.sender_id = auth.uid()
  )
);

drop policy if exists "Uploaders delete staged message attachments" on public.pbos_message_attachments;
create policy "Uploaders delete staged message attachments"
on public.pbos_message_attachments for delete to authenticated
using (
  uploader_id = auth.uid()
  and message_id is null
  and private.pbos_user_has_active_conversation_access(conversation_id, auth.uid())
);

grant select, insert, delete on public.pbos_message_attachments to authenticated;
revoke update on public.pbos_message_attachments from authenticated;
grant update (message_id) on public.pbos_message_attachments to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pbos-message-attachments',
  'pbos-message-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage INSERT happens before metadata exists, so path scope plus current conversation authority is checked.
drop policy if exists "Current participants upload message attachments" on storage.objects;
create policy "Current participants upload message attachments"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'pbos-message-attachments'
  and split_part(name, '/', 2) = auth.uid()::text
  and exists (
    select 1
    from public.pbos_conversations c
    join public.support_relationships r on r.id = c.relationship_id
    where c.id::text = split_part(name, '/', 1)
      and c.status = 'ACTIVE'
      and r.status = 'active'
      and (
        c.scholar_id = auth.uid()
        or r.supporter_id = auth.uid()
        or (
          r.supporter_email is not null
          and lower(r.supporter_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
      )
  )
);

drop policy if exists "Current participants read message attachments" on storage.objects;
create policy "Current participants read message attachments"
on storage.objects for select to authenticated
using (
  bucket_id = 'pbos-message-attachments'
  and exists (
    select 1 from public.pbos_message_attachments a
    where a.storage_path = name
      and private.pbos_user_has_active_conversation_access(a.conversation_id, auth.uid())
  )
);

drop policy if exists "Uploaders delete staged message attachment objects" on storage.objects;
create policy "Uploaders delete staged message attachment objects"
on storage.objects for delete to authenticated
using (
  bucket_id = 'pbos-message-attachments'
  and exists (
    select 1 from public.pbos_message_attachments a
    where a.storage_path = name
      and a.uploader_id = auth.uid()
      and a.message_id is null
      and private.pbos_user_has_active_conversation_access(a.conversation_id, auth.uid())
  )
);
