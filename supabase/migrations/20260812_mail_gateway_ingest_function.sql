create or replace function public.ingest_mail_support_message(
  p_sender_email text,
  p_subject text,
  p_body text,
  p_message_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_relationship public.support_relationships%rowtype;
  v_message public.support_messages;
begin
  if coalesce(trim(p_sender_email), '') = '' then
    return jsonb_build_object('ok', false, 'persisted', false, 'reason', 'Invalid sender email.');
  end if;

  if coalesce(trim(p_body), '') = '' then
    return jsonb_build_object('ok', false, 'persisted', false, 'reason', 'Invalid message body.');
  end if;

  select *
    into v_relationship
    from public.support_relationships
    where lower(supporter_email) = lower(trim(p_sender_email))
      and status = 'active'
    limit 1;

  if not found then
    return jsonb_build_object(
      'ok',
      true,
      'persisted',
      false,
      'reason',
      'No active support relationship found for sender.'
    );
  end if;

  insert into public.support_messages (
    scholar_id,
    sender_id,
    sender_role,
    body
  )
  values (
    v_relationship.scholar_id,
    v_relationship.supporter_id,
    coalesce(v_relationship.relationship, 'supporter'),
    p_body
  )
  returning * into v_message;

  return jsonb_build_object(
    'ok',
    true,
    'persisted',
    true,
    'subject',
    p_subject,
    'message_id',
    nullif(trim(p_message_id), ''),
    'message',
    to_jsonb(v_message),
    'scholar_id',
    v_message.scholar_id::text,
    'sender_role',
    v_message.sender_role
  );
end;
$$;

revoke all on function public.ingest_mail_support_message(text, text, text, text) from public;
grant execute on function public.ingest_mail_support_message(text, text, text, text) to anon, authenticated;
