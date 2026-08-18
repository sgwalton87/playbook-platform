-- Phase 7 Messaging Attachments least-privilege hardening.
-- Preserve the existing private bucket/RLS behavior while removing latent anonymous
-- metadata authority inherited from older production grants.

revoke all on table public.pbos_message_attachments from public, anon, authenticated;

-- Explicit column grants can survive table-level REVOKE, so remove all update
-- authority before restoring the one column required to bind a staged attachment.
revoke update (
  id,
  conversation_id,
  message_id,
  uploader_id,
  storage_path,
  original_name,
  mime_type,
  byte_size,
  created_at
) on table public.pbos_message_attachments from public, anon, authenticated;

grant select, insert, delete on table public.pbos_message_attachments to authenticated;
grant update (message_id) on table public.pbos_message_attachments to authenticated;

comment on table public.pbos_message_attachments is
  'Canonical private Messaging attachment metadata. Authenticated participants may read/stage/delete through RLS; staged-to-sent binding may update message_id only.';