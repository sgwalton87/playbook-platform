-- Shared Event Reminder subscriptions + database-scheduled notification delivery.

create extension if not exists pg_cron;

create table if not exists public.community_event_reminders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.community_events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  minutes_before integer not null check (minutes_before in (15,60,1440)),
  status text not null default 'active' check (status in ('active','cancelled')),
  last_delivered_for_start timestamptz,
  last_delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id,user_id,minutes_before)
);

create index if not exists community_event_reminders_due_idx
  on public.community_event_reminders(status,event_id,minutes_before)
  where status='active';
create index if not exists community_event_reminders_user_idx
  on public.community_event_reminders(user_id,updated_at desc);

alter table public.community_event_reminders enable row level security;
revoke all on public.community_event_reminders from anon, authenticated;
grant select on public.community_event_reminders to authenticated;

drop policy if exists community_event_reminders_owner_select on public.community_event_reminders;
create policy community_event_reminders_owner_select
  on public.community_event_reminders for select to authenticated
  using ((select auth.uid())=user_id);

create or replace function private.set_community_event_reminder(
  requested_event_id uuid,
  requested_minutes_before integer,
  requested_enabled boolean
)
returns table(
  event_id uuid,
  minutes_before integer,
  status text,
  last_delivered_for_start timestamptz,
  last_delivered_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  saved public.community_event_reminders%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if requested_minutes_before not in (15,60,1440) then
    raise exception 'Reminder offset is not supported.' using errcode='22023';
  end if;

  if requested_enabled then
    if not exists (
      select 1
        from public.community_events e
        join public.community_event_rsvps r
          on r.event_id=e.id and r.user_id=actor_id and r.status in ('going','interested')
       where e.id=requested_event_id
         and e.status='published'
         and e.starts_at is not null
         and e.starts_at>now()
    ) then
      raise exception 'A future published event with an active RSVP is required.' using errcode='42501';
    end if;

    insert into public.community_event_reminders(event_id,user_id,minutes_before,status,created_at,updated_at)
    values(requested_event_id,actor_id,requested_minutes_before,'active',now(),now())
    on conflict(event_id,user_id,minutes_before)
    do update set status='active',updated_at=now()
    returning * into saved;
  else
    update public.community_event_reminders
       set status='cancelled',updated_at=now()
     where event_id=requested_event_id
       and user_id=actor_id
       and minutes_before=requested_minutes_before
    returning * into saved;

    if saved.id is null then
      insert into public.community_event_reminders(event_id,user_id,minutes_before,status,created_at,updated_at)
      values(requested_event_id,actor_id,requested_minutes_before,'cancelled',now(),now())
      returning * into saved;
    end if;
  end if;

  return query
  select saved.event_id,saved.minutes_before,saved.status,
         saved.last_delivered_for_start,saved.last_delivered_at,saved.updated_at;
end;
$$;

revoke all on function private.set_community_event_reminder(uuid,integer,boolean) from public,anon,authenticated;
grant execute on function private.set_community_event_reminder(uuid,integer,boolean) to authenticated;

create or replace function public.set_community_event_reminder(
  requested_event_id uuid,
  requested_minutes_before integer,
  requested_enabled boolean
)
returns table(
  event_id uuid,
  minutes_before integer,
  status text,
  last_delivered_for_start timestamptz,
  last_delivered_at timestamptz,
  updated_at timestamptz
)
language sql
security invoker
set search_path=''
as $$
  select * from private.set_community_event_reminder(requested_event_id,requested_minutes_before,requested_enabled);
$$;

revoke all on function public.set_community_event_reminder(uuid,integer,boolean) from public,anon;
grant execute on function public.set_community_event_reminder(uuid,integer,boolean) to authenticated;

create or replace function private.process_due_event_reminders()
returns integer
language plpgsql
security definer
set search_path=''
as $$
declare
  reminder record;
  event_key text;
  reminder_label text;
  delivered_count integer := 0;
begin
  for reminder in
    select r.id,r.event_id,r.user_id,r.minutes_before,r.last_delivered_for_start,
           e.title,e.starts_at
      from public.community_event_reminders r
      join public.community_events e on e.id=r.event_id
      join public.community_event_rsvps v
        on v.event_id=r.event_id and v.user_id=r.user_id and v.status in ('going','interested')
     where r.status='active'
       and e.status='published'
       and e.starts_at is not null
       and e.starts_at>now()
       and e.starts_at-make_interval(mins=>r.minutes_before)<=now()
       and r.last_delivered_for_start is distinct from e.starts_at
     order by e.starts_at asc,r.id
     for update of r skip locked
  loop
    event_key := 'event-reminder:' || reminder.event_id::text || ':' || reminder.user_id::text || ':' ||
                 extract(epoch from reminder.starts_at)::bigint::text || ':' || reminder.minutes_before::text;
    reminder_label := case reminder.minutes_before
      when 15 then '15 minutes'
      when 60 then '1 hour'
      when 1440 then '1 day'
      else reminder.minutes_before::text || ' minutes'
    end;

    insert into public.pbos_notification_outbox(
      owner_id,event_key,event_type,event_payload,state,attempt_count,last_error,next_attempt_at,processed_at,created_at
    ) values (
      reminder.user_id,event_key,'event_reminder',
      jsonb_build_object(
        'eventKey',event_key,
        'type','event_reminder',
        'title','Event reminder: ' || left(reminder.title,140),
        'body','Your Playbook event starts in ' || reminder_label || '.',
        'href','/events/' || reminder.event_id::text,
        'priority',case when reminder.minutes_before=15 then 'high' else 'medium' end
      ),
      'DELIVERED',1,null,null,now(),now()
    )
    on conflict(owner_id,event_key) do nothing;

    insert into public.pbos_notifications(
      user_id,scholar_id,type,title,body,href,priority,read,delivery_status,source_event_key,provenance,created_at
    ) values (
      reminder.user_id,reminder.user_id,'event_reminder',
      'Event reminder: ' || left(reminder.title,140),
      'Your Playbook event starts in ' || reminder_label || '.',
      '/events/' || reminder.event_id::text,
      case when reminder.minutes_before=15 then 'high' else 'medium' end,
      false,'in_app',event_key,
      jsonb_build_array(jsonb_build_object(
        'source','community_event_reminder_cron',
        'eventId',reminder.event_id,
        'minutesBefore',reminder.minutes_before,
        'eventStart',reminder.starts_at,
        'authority','private.process_due_event_reminders'
      )),now()
    )
    on conflict(user_id,source_event_key) do nothing;

    update public.community_event_reminders
       set last_delivered_for_start=reminder.starts_at,
           last_delivered_at=now(),
           updated_at=now()
     where id=reminder.id;

    delivered_count := delivered_count+1;
  end loop;

  return delivered_count;
end;
$$;

revoke all on function private.process_due_event_reminders() from public,anon,authenticated;

-- Ensure one deterministic scheduler registration per environment.
do $$
declare existing_job bigint;
begin
  select jobid into existing_job from cron.job where jobname='playbook-event-reminders' limit 1;
  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;
  perform cron.schedule(
    'playbook-event-reminders',
    '*/5 * * * *',
    'select private.process_due_event_reminders();'
  );
end $$;

comment on table public.community_event_reminders is
  'User-owned Event reminder subscriptions. Canonical Event timing remains owned by community_events; delivery is idempotent per event start and offset.';
comment on function private.process_due_event_reminders() is
  'Private pg_cron worker that materializes due Event reminders into governed PBOS notification/outbox records without changing RSVP, attendance, check-in, or rewards.';
