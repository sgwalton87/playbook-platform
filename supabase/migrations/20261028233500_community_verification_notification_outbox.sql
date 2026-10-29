-- Durable, role-scoped Community Partner notification outbox.
-- Does not contain attached documents, student records or private applicant notes.
create table if not exists public.community_verification_notification_outbox(
 request_id uuid primary key references public.community_partner_verification_requests(id) on delete cascade,
 status text not null default 'queued' check(status in ('queued','sending','sent','failed','delivery_unknown')),
 claim_token uuid,
 attempts integer not null default 0 check(attempts between 0 and 5),
 last_error text,
 provider_message_id text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 sent_at timestamptz
);
alter table public.community_verification_notification_outbox enable row level security;
revoke all on public.community_verification_notification_outbox from anon,authenticated;

create or replace function public.claim_own_community_verification_notice(requested_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare token uuid:=gen_random_uuid();
begin
 if not exists(select 1 from public.community_partner_verification_requests r where r.id=requested_id and r.partner_user_id=auth.uid()) then
   raise exception 'Notification not authorized' using errcode='42501';
 end if;
 insert into public.community_verification_notification_outbox(request_id)
 values(requested_id) on conflict(request_id) do nothing;
 update public.community_verification_notification_outbox o
 set status='sending', claim_token=token, attempts=o.attempts+1, updated_at=now()
 where o.request_id=requested_id and o.status in('queued','failed')
   and o.attempts<3 and o.updated_at<now()-interval '10 seconds';
 if found then return token; end if;
 -- Newly created row can be claimed immediately.
 update public.community_verification_notification_outbox o
 set status='sending', claim_token=token, attempts=o.attempts+1,updated_at=now()
 where o.request_id=requested_id and o.status='queued' and o.attempts=0;
 if found then return token; end if;
 return null;
end $$;
revoke all on function public.claim_own_community_verification_notice(uuid) from public,anon;
grant execute on function public.claim_own_community_verification_notice(uuid) to authenticated;

create or replace function public.finish_own_community_verification_notice(
 requested_id uuid, requested_claim uuid, requested_status text, requested_error text default null,
 requested_message_id text default null
) returns boolean language plpgsql security definer set search_path='' as $$
begin
 if requested_status not in ('sent','failed','delivery_unknown') then raise exception 'Invalid delivery status'; end if;
 if not exists(select 1 from public.community_partner_verification_requests r where r.id=requested_id and r.partner_user_id=auth.uid()) then
  raise exception 'Notification not authorized' using errcode='42501';
 end if;
 update public.community_verification_notification_outbox
 set status=requested_status, claim_token=null, last_error=left(requested_error,500),
 provider_message_id=left(requested_message_id,500),sent_at=case when requested_status='sent' then now() else null end,updated_at=now()
 where request_id=requested_id and claim_token=requested_claim and status='sending';
 return found;
end $$;
revoke all on function public.finish_own_community_verification_notice(uuid,uuid,text,text,text) from public,anon;
grant execute on function public.finish_own_community_verification_notice(uuid,uuid,text,text,text) to authenticated;
