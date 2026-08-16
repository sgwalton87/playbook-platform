-- Mail gateway provenance and replay protection.
-- A provider message ID may create at most one support message.

alter table public.support_messages
  add column if not exists source_message_id text,
  add column if not exists source_channel text;

create unique index if not exists support_messages_source_message_idx
  on public.support_messages(source_message_id)
  where source_message_id is not null;
