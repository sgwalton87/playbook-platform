-- Canonical notification authority convergence.
-- System notification creation is driven by durable domain lifecycle records.
-- Authenticated clients retain read/acknowledge/preferences/retry, but cannot
-- manufacture notification or outbox rows or rewrite trusted event payloads.

revoke insert, update, delete on public.pbos_notifications from authenticated, anon;
revoke insert, update, delete on public.pbos_notification_outbox from authenticated, anon;
revoke insert, update, delete on public.pbos_notification_preferences from authenticated, anon;
grant select on public.pbos_notifications, public.pbos_notification_outbox, public.pbos_notification_preferences to authenticated;

drop policy if exists "Owners manage PBOS notifications" on public.pbos_notifications;
create policy "Owners view PBOS notifications" on public.pbos_notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "Owners manage notification outbox" on public.pbos_notification_outbox;
create policy "Owners view notification outbox" on public.pbos_notification_outbox for select to authenticated using (owner_id = auth.uid());
drop policy if exists "Owners manage notification preferences" on public.pbos_notification_preferences;
create policy "Owners view notification preferences" on public.pbos_notification_preferences for select to authenticated using (owner_id = auth.uid());

create or replace function private.enqueue_notification_event(requested_owner_id uuid, requested_event_key text, requested_event_type text, requested_title text, requested_body text, requested_href text, requested_priority text default 'medium')
returns uuid language plpgsql security definer set search_path='' as $$
declare outbox_id uuid;
begin
  if requested_owner_id is null or nullif(trim(requested_event_key),'') is null
     or requested_event_type not in ('message','invitation','shared_action','compass_alert','mail_reply','network_blocker','recommendation','verification','opportunity','milestone','intervention')
     or nullif(trim(requested_title),'') is null or nullif(trim(requested_body),'') is null
     or requested_href !~ '^/' or requested_priority not in ('low','medium','high','urgent') then
    raise exception 'invalid notification event' using errcode='22023';
  end if;
  insert into public.pbos_notification_outbox(owner_id,event_key,event_type,event_payload,state,attempt_count)
  values (requested_owner_id,requested_event_key,requested_event_type,jsonb_build_object('eventKey',requested_event_key,'type',requested_event_type,'title',left(trim(requested_title),160),'body',left(trim(requested_body),1000),'href',requested_href,'priority',requested_priority),'PENDING',0)
  on conflict (owner_id,event_key) do update set event_type=excluded.event_type,event_payload=excluded.event_payload where public.pbos_notification_outbox.state='PENDING'
  returning id into outbox_id;
  if outbox_id is null then select id into outbox_id from public.pbos_notification_outbox where owner_id=requested_owner_id and event_key=requested_event_key; end if;
  return outbox_id;
end;
$$;
revoke all on function private.enqueue_notification_event(uuid,text,text,text,text,text,text) from public,anon,authenticated;

create or replace function public.acknowledge_notification(requested_notification_id uuid default null, acknowledge_all boolean default false)
returns integer language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
  if auth.uid() is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if acknowledge_all then update public.pbos_notifications set read=true, acknowledged_at=coalesce(acknowledged_at,now()) where user_id=auth.uid() and read=false;
  else
    if requested_notification_id is null then raise exception 'Notification ID required.' using errcode='22023'; end if;
    update public.pbos_notifications set read=true, acknowledged_at=coalesce(acknowledged_at,now()) where id=requested_notification_id and user_id=auth.uid();
  end if;
  get diagnostics affected = row_count; return affected;
end;
$$;

create or replace function public.set_notification_preference(requested_type text, requested_mode text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if requested_type not in ('message','invitation','shared_action','compass_alert','mail_reply','network_blocker','recommendation','verification','opportunity','milestone','intervention') or requested_mode not in ('immediate','daily_digest','weekly_digest','muted') then raise exception 'Invalid notification preference.' using errcode='22023'; end if;
  insert into public.pbos_notification_preferences(owner_id,notification_type,mode,updated_at) values(auth.uid(),requested_type,requested_mode,now())
  on conflict(owner_id,notification_type) do update set mode=excluded.mode,updated_at=now();
end;
$$;

create or replace function public.transition_notification_outbox(requested_outbox_id uuid, requested_state text, requested_error text default null, requested_next_attempt_at timestamptz default null)
returns void language plpgsql security definer set search_path='' as $$
declare current_state text;
begin
  if auth.uid() is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  select state into current_state from public.pbos_notification_outbox where id=requested_outbox_id and owner_id=auth.uid() for update;
  if current_state is null then raise exception 'Notification outbox item not found.' using errcode='P0002'; end if;
  if requested_state not in ('FAILED','SUPPRESSED','DIGEST_QUEUED') then raise exception 'Unsupported outbox transition.' using errcode='22023'; end if;
  if current_state='DELIVERED' then raise exception 'Delivered notification cannot be reopened.' using errcode='22023'; end if;
  update public.pbos_notification_outbox set state=requested_state,attempt_count=case when requested_state='FAILED' then attempt_count+1 else attempt_count end,last_error=case when requested_state='FAILED' then left(coalesce(requested_error,'Delivery failed'),500) else null end,next_attempt_at=requested_next_attempt_at,processed_at=case when requested_state='SUPPRESSED' then now() else null end where id=requested_outbox_id and owner_id=auth.uid();
end;
$$;

create or replace function public.finalize_notification_delivery(requested_outbox_id uuid, requested_priority text, requested_provenance jsonb default '[]'::jsonb)
returns public.pbos_notifications language plpgsql security definer set search_path='' as $$
declare outbox public.pbos_notification_outbox%rowtype; saved public.pbos_notifications%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if requested_priority not in ('low','medium','high','urgent') then raise exception 'Invalid priority.' using errcode='22023'; end if;
  select * into outbox from public.pbos_notification_outbox where id=requested_outbox_id and owner_id=auth.uid() for update;
  if not found then raise exception 'Notification outbox item not found.' using errcode='P0002'; end if;
  if outbox.state='DELIVERED' then select * into saved from public.pbos_notifications where user_id=auth.uid() and source_event_key=outbox.event_key; return saved; end if;
  if outbox.state not in ('PENDING','FAILED') then raise exception 'Outbox item is not deliverable.' using errcode='22023'; end if;
  insert into public.pbos_notifications(user_id,scholar_id,type,title,body,href,priority,read,delivery_status,source_event_key,provenance)
  values(auth.uid(),auth.uid(),outbox.event_type,outbox.event_payload->>'title',outbox.event_payload->>'body',outbox.event_payload->>'href',requested_priority,false,'in_app',outbox.event_key,coalesce(requested_provenance,'[]'::jsonb))
  on conflict(user_id,source_event_key) do update set type=excluded.type,title=excluded.title,body=excluded.body,href=excluded.href,priority=excluded.priority,delivery_status='in_app',provenance=excluded.provenance returning * into saved;
  update public.pbos_notification_outbox set state='DELIVERED',processed_at=now(),last_error=null,next_attempt_at=null,attempt_count=attempt_count+1 where id=outbox.id;
  return saved;
end;
$$;

revoke all on function public.acknowledge_notification(uuid,boolean) from public,anon,authenticated;
revoke all on function public.set_notification_preference(text,text) from public,anon,authenticated;
revoke all on function public.transition_notification_outbox(uuid,text,text,timestamptz) from public,anon,authenticated;
revoke all on function public.finalize_notification_delivery(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.acknowledge_notification(uuid,boolean) to authenticated;
grant execute on function public.set_notification_preference(text,text) to authenticated;
grant execute on function public.transition_notification_outbox(uuid,text,text,timestamptz) to authenticated;
grant execute on function public.finalize_notification_delivery(uuid,text,jsonb) to authenticated;

create or replace function private.verification_destination(request_type text) returns text language sql immutable set search_path='' as $$
  select case request_type when 'coach' then '/coach-os' when 'educator' then '/educator-os' when 'counselor' then '/counselor-os' when 'district' then '/district-os' when 'recruiting' then '/recruiting-os' when 'admissions' then '/admissions-os' when 'employer' then '/employer-os' when 'brand-partner' then '/brand-partner-os' when 'community-partner' then '/community-partner-os' when 'athlete-abroad' then '/athlete-abroad-os' else '/notifications' end;
$$;
revoke all on function private.verification_destination(text) from public,anon,authenticated;

create or replace function private.notify_verification_review() returns trigger language plpgsql security definer set search_path='' as $$
begin
  perform private.enqueue_notification_event(new.subject_user_id,'verification:'||new.request_type||':'||new.request_id::text||':'||new.new_status,'verification',case new.new_status when 'approved' then 'Verification approved' when 'rejected' then 'Verification needs attention' else 'Verification review started' end,case new.new_status when 'approved' then 'Your '||replace(new.request_type,'-',' ')||' verification was approved.' when 'rejected' then 'Your '||replace(new.request_type,'-',' ')||' verification was not approved. Review the decision and next steps.' else 'A reviewer has started reviewing your verification evidence.' end,private.verification_destination(new.request_type),case when new.new_status='rejected' then 'high' else 'medium' end);
  return new;
end;
$$;

create or replace function private.notify_learning_credential() returns trigger language plpgsql security definer set search_path='' as $$
begin
  perform private.enqueue_notification_event(new.user_id,'credential:'||new.id::text,'milestone','New credential earned',new.credential_name||' is now part of your Playbook record.','/certificates','medium'); return new;
end;
$$;
revoke all on function private.notify_verification_review() from public,anon,authenticated;
revoke all on function private.notify_learning_credential() from public,anon,authenticated;

drop trigger if exists verification_review_notification on public.verification_review_events;
create trigger verification_review_notification after insert on public.verification_review_events for each row execute function private.notify_verification_review();
drop trigger if exists learning_credential_notification on public.learning_credentials;
create trigger learning_credential_notification after insert on public.learning_credentials for each row execute function private.notify_learning_credential();

-- Opportunity recommendations and application events remain intentionally absent
-- from the trusted producer set until their older owner-FOR-ALL mutation policies
-- are narrowed. A user-writable lifecycle table is not accepted as system truth.
drop trigger if exists opportunity_recommendation_notification on public.pbos_opportunity_recommendations;
drop trigger if exists application_event_notification on public.application_workspace_events;
