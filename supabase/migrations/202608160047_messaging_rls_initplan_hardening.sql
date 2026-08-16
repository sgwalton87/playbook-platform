-- Performance-only hardening for governed Messaging RLS.
-- Authorization semantics remain unchanged; stable auth helpers are evaluated once per statement.

-- Conversations.
drop policy if exists "Governed participants view conversations" on public.pbos_conversations;
create policy "Governed participants view conversations"
on public.pbos_conversations for select to authenticated
using (
  private.pbos_user_has_active_conversation_access(id, (select auth.uid()))
);

drop policy if exists "Governed actors create conversations" on public.pbos_conversations;
create policy "Governed actors create conversations"
on public.pbos_conversations for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.support_relationships r
    where r.id = relationship_id
      and r.status = 'active'
      and (
        scholar_id = (select auth.uid())
        or r.supporter_id = (select auth.uid())
        or (
          r.supporter_email is not null
          and lower(r.supporter_email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
        )
      )
  )
);

-- Participant state.
drop policy if exists "Participants view their state" on public.pbos_conversation_participants;
create policy "Participants view their state"
on public.pbos_conversation_participants for select to authenticated
using (
  user_id = (select auth.uid())
  and private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
);

drop policy if exists "Authorized actors join conversations" on public.pbos_conversation_participants;
create policy "Authorized actors join conversations"
on public.pbos_conversation_participants for insert to authenticated
with check (
  user_id = (select auth.uid())
  and private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
);

drop policy if exists "Participants update their state" on public.pbos_conversation_participants;
create policy "Participants update their state"
on public.pbos_conversation_participants for update to authenticated
using (
  user_id = (select auth.uid())
  and private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
)
with check (
  user_id = (select auth.uid())
  and private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
);

-- Message history, delivery and moderation.
drop policy if exists "Governed participants view messages" on public.pbos_messages;
create policy "Governed participants view messages"
on public.pbos_messages for select to authenticated
using (
  private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
);

drop policy if exists "Governed participants send messages" on public.pbos_messages;
create policy "Governed participants send messages"
on public.pbos_messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and scholar_id = (
    select c.scholar_id from public.pbos_conversations c where c.id = pbos_messages.conversation_id
  )
  and private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
  and exists (
    select 1 from public.pbos_conversation_participants p
    where p.conversation_id = pbos_messages.conversation_id
      and p.user_id = (select auth.uid())
      and p.blocked_at is null
  )
);

drop policy if exists "Governed participants update messages" on public.pbos_messages;
create policy "Governed participants update messages"
on public.pbos_messages for update to authenticated
using (
  private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
  and (
    sender_id = (select auth.uid())
    or exists (
      select 1 from public.pbos_conversation_participants p
      where p.conversation_id = pbos_messages.conversation_id
        and p.user_id = (select auth.uid())
    )
  )
)
with check (
  private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
  and (
    sender_id = (select auth.uid())
    or exists (
      select 1 from public.pbos_conversation_participants p
      where p.conversation_id = pbos_messages.conversation_id
        and p.user_id = (select auth.uid())
    )
  )
);

-- Attachment metadata.
drop policy if exists "Current participants view message attachments" on public.pbos_message_attachments;
create policy "Current participants view message attachments"
on public.pbos_message_attachments for select to authenticated
using (
  private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
);

drop policy if exists "Current participants stage message attachments" on public.pbos_message_attachments;
create policy "Current participants stage message attachments"
on public.pbos_message_attachments for insert to authenticated
with check (
  uploader_id = (select auth.uid())
  and message_id is null
  and private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
);

drop policy if exists "Uploaders attach staged message attachments" on public.pbos_message_attachments;
create policy "Uploaders attach staged message attachments"
on public.pbos_message_attachments for update to authenticated
using (
  uploader_id = (select auth.uid())
  and message_id is null
  and private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
)
with check (
  uploader_id = (select auth.uid())
  and message_id is not null
  and private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
  and exists (
    select 1 from public.pbos_messages m
    where m.id = message_id
      and m.conversation_id = pbos_message_attachments.conversation_id
      and m.sender_id = (select auth.uid())
  )
);

drop policy if exists "Uploaders delete staged message attachments" on public.pbos_message_attachments;
create policy "Uploaders delete staged message attachments"
on public.pbos_message_attachments for delete to authenticated
using (
  uploader_id = (select auth.uid())
  and message_id is null
  and private.pbos_user_has_active_conversation_access(conversation_id, (select auth.uid()))
);

-- Private Storage objects. The path/relationship constraints are unchanged.
drop policy if exists "Current participants upload message attachments" on storage.objects;
create policy "Current participants upload message attachments"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'pbos-message-attachments'
  and split_part(name, '/', 2) = (select auth.uid())::text
  and exists (
    select 1
    from public.pbos_conversations c
    join public.support_relationships r on r.id = c.relationship_id
    where c.id::text = split_part(name, '/', 1)
      and c.status = 'ACTIVE'
      and r.status = 'active'
      and (
        c.scholar_id = (select auth.uid())
        or r.supporter_id = (select auth.uid())
        or (
          r.supporter_email is not null
          and lower(r.supporter_email) = lower(coalesce((select auth.jwt() ->> 'email'), ''))
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
      and private.pbos_user_has_active_conversation_access(a.conversation_id, (select auth.uid()))
  )
);

drop policy if exists "Uploaders delete staged message attachment objects" on storage.objects;
create policy "Uploaders delete staged message attachment objects"
on storage.objects for delete to authenticated
using (
  bucket_id = 'pbos-message-attachments'
  and split_part(name, '/', 2) = (select auth.uid())::text
  and (
    exists (
      select 1 from public.pbos_message_attachments a
      where a.storage_path = name
        and a.uploader_id = (select auth.uid())
        and a.message_id is null
        and private.pbos_user_has_active_conversation_access(a.conversation_id, (select auth.uid()))
    )
    or (
      not exists (
        select 1 from public.pbos_message_attachments a where a.storage_path = name
      )
      and exists (
        select 1 from public.pbos_conversations c
        where c.id::text = split_part(name, '/', 1)
          and private.pbos_user_has_active_conversation_access(c.id, (select auth.uid()))
      )
    )
  )
);
