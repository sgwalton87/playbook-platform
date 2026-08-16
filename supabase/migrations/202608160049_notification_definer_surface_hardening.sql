-- Keep privileged notification mutations out of the exposed public SECURITY DEFINER surface.
-- Public RPCs remain SECURITY INVOKER wrappers; private helpers own trusted mutation logic.
-- Legacy public signatures stay temporarily compatible for rolling deployments, but untrusted
-- delivery metadata parameters are ignored and recomputed from trusted database state.

create or replace function private.acknowledge_notification(
  requested_notification_id uuid default null,
  acknowledge_all boolean default false
)
returns integer
language plpgsql
security definer
set search_path=''
as $$
declare affected integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;

  if acknowledge_all then
    update public.pbos_notifications
       set read=true,
           acknowledged_at=coalesce(acknowledged_at,now())
     where user_id=auth.uid()
       and read=false;
  else
    if requested_notification_id is null then
      raise exception 'Notification ID required.' using errcode='22023';
    end if;
    update public.pbos_notifications
       set read=true,
           acknowledged_at=coalesce(acknowledged_at,now())
     where id=requested_notification_id
       and user_id=auth.uid();
  end if;

  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace function private.set_notification_preference(
  requested_type text,
  requested_mode text
)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if requested_type not in ('message','invitation','shared_action','compass_alert','mail_reply','network_blocker','recommendation','verification','opportunity','milestone','intervention')
     or requested_mode not in ('immediate','daily_digest','weekly_digest','muted') then
    raise exception 'Invalid notification preference.' using errcode='22023';
  end if;

  insert into public.pbos_notification_preferences(owner_id,notification_type,mode,updated_at)
  values(auth.uid(),requested_type,requested_mode,now())
  on conflict(owner_id,notification_type)
  do update set mode=excluded.mode,updated_at=now();
end;
$$;

create or replace function private.transition_notification_outbox(
  requested_outbox_id uuid,
  requested_state text
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  outbox public.pbos_notification_outbox%rowtype;
  preference_mode text;
  digest_days integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;

  select * into outbox
    from public.pbos_notification_outbox
   where id=requested_outbox_id
     and owner_id=auth.uid()
   for update;

  if not found then
    raise exception 'Notification outbox item not found.' using errcode='P0002';
  end if;
  if outbox.state='DELIVERED' then
    raise exception 'Delivered notification cannot be reopened.' using errcode='22023';
  end if;
  if requested_state not in ('FAILED','SUPPRESSED','DIGEST_QUEUED') then
    raise exception 'Unsupported outbox transition.' using errcode='22023';
  end if;

  select mode into preference_mode
    from public.pbos_notification_preferences
   where owner_id=auth.uid()
     and notification_type=outbox.event_type;
  preference_mode := coalesce(preference_mode,'immediate');

  if requested_state='SUPPRESSED' then
    if outbox.state <> 'PENDING' or preference_mode <> 'muted' then
      raise exception 'Notification is not eligible for suppression.' using errcode='22023';
    end if;
    update public.pbos_notification_outbox
       set state='SUPPRESSED',
           last_error=null,
           next_attempt_at=null,
           processed_at=now()
     where id=outbox.id;
    return;
  end if;

  if requested_state='DIGEST_QUEUED' then
    if outbox.state <> 'PENDING' or preference_mode not in ('daily_digest','weekly_digest') then
      raise exception 'Notification is not eligible for digest delivery.' using errcode='22023';
    end if;
    digest_days := case when preference_mode='weekly_digest' then 7 else 1 end;
    update public.pbos_notification_outbox
       set state='DIGEST_QUEUED',
           last_error=null,
           next_attempt_at=now() + make_interval(days => digest_days),
           processed_at=null
     where id=outbox.id;
    return;
  end if;

  -- FAILED is intentionally retryable, but callers cannot inject error text or arbitrary retry timing.
  if outbox.state not in ('PENDING','FAILED') then
    raise exception 'Notification is not eligible for retry.' using errcode='22023';
  end if;
  update public.pbos_notification_outbox
     set state='FAILED',
         attempt_count=attempt_count+1,
         last_error='Delivery failed; retry available.',
         next_attempt_at=now() + (interval '1 minute' * power(2,least(attempt_count,6))),
         processed_at=null
   where id=outbox.id;
end;
$$;

create or replace function private.finalize_notification_delivery(
  requested_outbox_id uuid
)
returns public.pbos_notifications
language plpgsql
security definer
set search_path=''
as $$
declare
  outbox public.pbos_notification_outbox%rowtype;
  saved public.pbos_notifications%rowtype;
  base_priority text;
  trusted_priority text;
  trusted_provenance jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;

  select * into outbox
    from public.pbos_notification_outbox
   where id=requested_outbox_id
     and owner_id=auth.uid()
   for update;

  if not found then
    raise exception 'Notification outbox item not found.' using errcode='P0002';
  end if;

  if outbox.state='DELIVERED' then
    select * into saved
      from public.pbos_notifications
     where user_id=auth.uid()
       and source_event_key=outbox.event_key;
    return saved;
  end if;

  if outbox.state not in ('PENDING','FAILED') then
    raise exception 'Outbox item is not deliverable.' using errcode='22023';
  end if;

  base_priority := case
    when outbox.event_payload->>'priority' in ('low','medium','high','urgent')
      then outbox.event_payload->>'priority'
    else 'medium'
  end;
  trusted_priority := case
    when outbox.attempt_count >= 3 then 'urgent'
    when outbox.attempt_count >= 2 and base_priority <> 'urgent' then 'high'
    else base_priority
  end;

  trusted_provenance := jsonb_build_array(jsonb_build_object(
    'source','notification_outbox',
    'outboxId',outbox.id,
    'eventKey',outbox.event_key,
    'authority','private.finalize_notification_delivery'
  ));

  insert into public.pbos_notifications(
    user_id,scholar_id,type,title,body,href,priority,read,delivery_status,source_event_key,provenance
  ) values (
    auth.uid(),auth.uid(),outbox.event_type,
    outbox.event_payload->>'title',outbox.event_payload->>'body',outbox.event_payload->>'href',
    trusted_priority,false,'in_app',outbox.event_key,trusted_provenance
  )
  on conflict(user_id,source_event_key)
  do update set
    type=excluded.type,
    title=excluded.title,
    body=excluded.body,
    href=excluded.href,
    priority=excluded.priority,
    delivery_status='in_app',
    provenance=excluded.provenance
  returning * into saved;

  update public.pbos_notification_outbox
     set state='DELIVERED',
         processed_at=now(),
         last_error=null,
         next_attempt_at=null,
         attempt_count=attempt_count+1
   where id=outbox.id;

  return saved;
end;
$$;

revoke all on function private.acknowledge_notification(uuid,boolean) from public,anon,authenticated;
revoke all on function private.set_notification_preference(text,text) from public,anon,authenticated;
revoke all on function private.transition_notification_outbox(uuid,text) from public,anon,authenticated;
revoke all on function private.finalize_notification_delivery(uuid) from public,anon,authenticated;
grant execute on function private.acknowledge_notification(uuid,boolean) to authenticated;
grant execute on function private.set_notification_preference(text,text) to authenticated;
grant execute on function private.transition_notification_outbox(uuid,text) to authenticated;
grant execute on function private.finalize_notification_delivery(uuid) to authenticated;

-- Exposed RPCs are invoker wrappers only.
create or replace function public.acknowledge_notification(
  requested_notification_id uuid default null,
  acknowledge_all boolean default false
)
returns integer
language sql
security invoker
set search_path=''
as $$
  select private.acknowledge_notification(requested_notification_id,acknowledge_all);
$$;

create or replace function public.set_notification_preference(
  requested_type text,
  requested_mode text
)
returns void
language sql
security invoker
set search_path=''
as $$
  select private.set_notification_preference(requested_type,requested_mode);
$$;

create or replace function public.transition_notification_outbox(
  requested_outbox_id uuid,
  requested_state text
)
returns void
language sql
security invoker
set search_path=''
as $$
  select private.transition_notification_outbox(requested_outbox_id,requested_state);
$$;

-- Backward-compatible wrapper for an older server deployment during rollout.
create or replace function public.transition_notification_outbox(
  requested_outbox_id uuid,
  requested_state text,
  requested_error text default null,
  requested_next_attempt_at timestamptz default null
)
returns void
language sql
security invoker
set search_path=''
as $$
  select private.transition_notification_outbox(requested_outbox_id,requested_state);
$$;

create or replace function public.finalize_notification_delivery(
  requested_outbox_id uuid
)
returns public.pbos_notifications
language sql
security invoker
set search_path=''
as $$
  select private.finalize_notification_delivery(requested_outbox_id);
$$;

-- Backward-compatible wrapper. Caller-supplied priority/provenance are intentionally ignored.
create or replace function public.finalize_notification_delivery(
  requested_outbox_id uuid,
  requested_priority text,
  requested_provenance jsonb default '[]'::jsonb
)
returns public.pbos_notifications
language sql
security invoker
set search_path=''
as $$
  select private.finalize_notification_delivery(requested_outbox_id);
$$;

revoke all on function public.acknowledge_notification(uuid,boolean) from public,anon,authenticated;
revoke all on function public.set_notification_preference(text,text) from public,anon,authenticated;
revoke all on function public.transition_notification_outbox(uuid,text) from public,anon,authenticated;
revoke all on function public.transition_notification_outbox(uuid,text,text,timestamptz) from public,anon,authenticated;
revoke all on function public.finalize_notification_delivery(uuid) from public,anon,authenticated;
revoke all on function public.finalize_notification_delivery(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.acknowledge_notification(uuid,boolean) to authenticated;
grant execute on function public.set_notification_preference(text,text) to authenticated;
grant execute on function public.transition_notification_outbox(uuid,text) to authenticated;
grant execute on function public.transition_notification_outbox(uuid,text,text,timestamptz) to authenticated;
grant execute on function public.finalize_notification_delivery(uuid) to authenticated;
grant execute on function public.finalize_notification_delivery(uuid,text,jsonb) to authenticated;
