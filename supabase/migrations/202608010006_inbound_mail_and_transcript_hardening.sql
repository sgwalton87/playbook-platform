-- Replay-safe inbound mail persistence and authenticated transcript ownership.
create table if not exists public.inbound_mail_receipts (
  id uuid primary key default gen_random_uuid(),
  provider_message_id text not null unique,
  sender_email text not null,
  relationship_id uuid references public.support_relationships(id) on delete set null,
  support_message_id uuid references public.support_messages(id) on delete set null,
  received_at timestamptz not null default now()
);
alter table public.inbound_mail_receipts enable row level security;

create or replace function public.ingest_support_mail(p_message_id text,p_sender_email text,p_body text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare v_relationship public.support_relationships%rowtype; v_message_id uuid; v_receipt_id uuid;
begin
  if nullif(trim(p_message_id),'') is null or nullif(trim(p_sender_email),'') is null then raise exception 'mail_identity_required'; end if;
  if length(p_body)>10000 then raise exception 'mail_body_too_large'; end if;
  if exists(select 1 from public.inbound_mail_receipts where provider_message_id=p_message_id) then
    return jsonb_build_object('persisted',false,'duplicate',true,'reason','Provider message already processed.');
  end if;
  select * into v_relationship from public.support_relationships where lower(supporter_email)=lower(p_sender_email) and status='active' order by created_at desc limit 1;
  if not found then
    insert into public.inbound_mail_receipts(provider_message_id,sender_email) values(p_message_id,lower(p_sender_email)) returning id into v_receipt_id;
    return jsonb_build_object('persisted',false,'duplicate',false,'receiptId',v_receipt_id,'reason','No active support relationship found for sender.');
  end if;
  insert into public.support_messages(scholar_id,relationship_id,sender_id,sender_role,recipient_id,body,visibility)
  values(v_relationship.scholar_id,v_relationship.id,v_relationship.supporter_id,v_relationship.relationship,v_relationship.scholar_id,trim(p_body),'participants') returning id into v_message_id;
  insert into public.inbound_mail_receipts(provider_message_id,sender_email,relationship_id,support_message_id)
  values(p_message_id,lower(p_sender_email),v_relationship.id,v_message_id) returning id into v_receipt_id;
  return jsonb_build_object('persisted',true,'duplicate',false,'receiptId',v_receipt_id,'messageId',v_message_id,'scholarId',v_relationship.scholar_id,'senderRole',v_relationship.relationship);
end; $$;
revoke all on function public.ingest_support_mail(text,text,text) from public,anon,authenticated;
grant execute on function public.ingest_support_mail(text,text,text) to service_role;

create policy "Scholars manage own AG progress" on public.ag_progress for all to authenticated
using(user_id=auth.uid()) with check(user_id=auth.uid());
