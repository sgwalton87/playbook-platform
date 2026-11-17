-- Read-only own-request notification receipt. SMTP acceptance is not inbox delivery.
create or replace function public.get_own_community_verification_notification_status()
returns table(request_id uuid, status text, updated_at timestamptz, sent_at timestamptz)
language sql stable security definer set search_path=''
as $$
 select o.request_id,o.status,o.updated_at,o.sent_at
 from public.community_verification_notification_outbox o
 join public.community_partner_verification_requests r on r.id=o.request_id
 where r.partner_user_id=auth.uid()
$$;
revoke all on function public.get_own_community_verification_notification_status() from public,anon;
grant execute on function public.get_own_community_verification_notification_status() to authenticated;
