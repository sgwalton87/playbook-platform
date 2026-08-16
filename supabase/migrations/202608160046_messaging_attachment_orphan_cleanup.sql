-- Permit an uploader to clean up an object if metadata creation fails, while
-- preserving the rule that an attachment already bound to a message cannot be
-- deleted directly from Storage by a participant.
drop policy if exists "Uploaders delete staged message attachment objects" on storage.objects;
create policy "Uploaders delete staged message attachment objects"
on storage.objects for delete to authenticated
using (
  bucket_id = 'pbos-message-attachments'
  and split_part(name, '/', 2) = auth.uid()::text
  and (
    exists (
      select 1 from public.pbos_message_attachments a
      where a.storage_path = name
        and a.uploader_id = auth.uid()
        and a.message_id is null
        and private.pbos_user_has_active_conversation_access(a.conversation_id, auth.uid())
    )
    or (
      not exists (select 1 from public.pbos_message_attachments a where a.storage_path = name)
      and exists (
        select 1 from public.pbos_conversations c
        where c.id::text = split_part(name, '/', 1)
          and private.pbos_user_has_active_conversation_access(c.id, auth.uid())
      )
    )
  )
);
