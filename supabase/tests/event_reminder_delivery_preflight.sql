\set ON_ERROR_STOP on
begin;

-- Scheduler and subscription owner must exist.
do $$
begin
  if not exists(select 1 from pg_extension where extname='pg_cron') then
    raise exception 'pg_cron extension is required for Event reminder delivery';
  end if;
  if to_regclass('public.community_event_reminders') is null then
    raise exception 'community_event_reminders is missing';
  end if;
  if not (select relrowsecurity from pg_class where oid='public.community_event_reminders'::regclass) then
    raise exception 'community_event_reminders must keep RLS enabled';
  end if;
end $$;

-- Clients can read only their reminder subscriptions; writes are governed RPC-only.
do $$
begin
  if not has_table_privilege('authenticated','public.community_event_reminders','SELECT')
     or has_table_privilege('authenticated','public.community_event_reminders','INSERT')
     or has_table_privilege('authenticated','public.community_event_reminders','UPDATE')
     or has_table_privilege('authenticated','public.community_event_reminders','DELETE') then
    raise exception 'community_event_reminders client grants changed';
  end if;
  if has_table_privilege('anon','public.community_event_reminders','SELECT') then
    raise exception 'anonymous reminder subscription access is prohibited';
  end if;
  if not exists(
    select 1 from pg_policies
     where schemaname='public' and tablename='community_event_reminders'
       and policyname='community_event_reminders_owner_select'
       and cmd='SELECT' and qual ilike '%auth.uid()%user_id%'
  ) then
    raise exception 'owner-only reminder read policy is missing';
  end if;
end $$;

-- Setter keeps the public/private authority split.
do $$
declare public_proc regprocedure := 'public.set_community_event_reminder(uuid,integer,boolean)'::regprocedure;
        private_proc regprocedure := 'private.set_community_event_reminder(uuid,integer,boolean)'::regprocedure;
begin
  if (select prosecdef from pg_proc where oid=public_proc) then
    raise exception 'public reminder setter must be SECURITY INVOKER';
  end if;
  if not (select prosecdef from pg_proc where oid=private_proc) then
    raise exception 'private reminder setter must be SECURITY DEFINER';
  end if;
  if has_function_privilege('anon',public_proc,'EXECUTE') or has_function_privilege('anon',private_proc,'EXECUTE') then
    raise exception 'anonymous reminder mutation is prohibited';
  end if;
  if not has_function_privilege('authenticated',public_proc,'EXECUTE')
     or not has_function_privilege('authenticated',private_proc,'EXECUTE') then
    raise exception 'authenticated reminder wrapper path is incomplete';
  end if;
end $$;

-- Reminder subscriptions require truthful future Event participation.
do $$
declare body text;
begin
  select lower(pg_get_functiondef('private.set_community_event_reminder(uuid,integer,boolean)'::regprocedure)) into body;
  if body !~ 'requested_minutes_before not in \(15,60,1440\)' then
    raise exception 'governed reminder offsets changed';
  end if;
  if body !~ 'community_events' or body !~ 'community_event_rsvps' then
    raise exception 'reminder setter must resolve canonical Event and RSVP state';
  end if;
  if body !~ 'status in \(''going'',''interested''\)' or body !~ 'e\.status=''published''' or body !~ 'e\.starts_at>now\(\)' then
    raise exception 'reminder setter must require future published Event participation';
  end if;
end $$;

-- Cron registration must be deterministic and frequent enough for the 15-minute option.
do $$
declare job_count integer; job_schedule text; job_command text;
begin
  select count(*),min(schedule),min(command)
    into job_count,job_schedule,job_command
    from cron.job where jobname='playbook-event-reminders';
  if job_count<>1 then
    raise exception 'expected exactly one playbook-event-reminders cron job, got %',job_count;
  end if;
  if job_schedule<>'*/5 * * * *' then
    raise exception 'Event reminder scheduler must run every five minutes, got %',job_schedule;
  end if;
  if btrim(job_command)<>'select private.process_due_event_reminders();' then
    raise exception 'Event reminder cron command changed: %',job_command;
  end if;
end $$;

-- Worker is a private scheduler authority, not a user-callable RPC.
do $$
declare worker regprocedure := 'private.process_due_event_reminders()'::regprocedure;
begin
  if not (select prosecdef from pg_proc where oid=worker) then
    raise exception 'Event reminder worker must be SECURITY DEFINER';
  end if;
  if has_function_privilege('anon',worker,'EXECUTE')
     or has_function_privilege('authenticated',worker,'EXECUTE') then
    raise exception 'Event reminder worker must not be client-executable';
  end if;
end $$;

-- Worker must be due-only, RSVP-aware, concurrency-safe and idempotent.
do $$
declare body text;
begin
  select lower(pg_get_functiondef('private.process_due_event_reminders()'::regprocedure)) into body;
  if body !~ 'community_event_reminders' or body !~ 'community_events' or body !~ 'community_event_rsvps' then
    raise exception 'worker must resolve reminder, Event, and RSVP canonical owners';
  end if;
  if body !~ 'v\.status in \(''going'',''interested''\)' or body !~ 'e\.status=''published''' or body !~ 'e\.starts_at>now\(\)' then
    raise exception 'worker must re-check active participation and future published Event state';
  end if;
  if body !~ 'e\.starts_at-make_interval\(mins=>r\.minutes_before\)<=now\(\)' then
    raise exception 'worker due-time calculation changed';
  end if;
  if body !~ 'for update of r skip locked' then
    raise exception 'worker must lock due subscriptions with SKIP LOCKED';
  end if;
  if body !~ 'last_delivered_for_start is distinct from e\.starts_at' then
    raise exception 'worker must support idempotence and Event rescheduling';
  end if;
  if body !~ 'event-reminder:' or body !~ 'extract\(epoch from reminder\.starts_at\)' then
    raise exception 'deterministic Event reminder key must include canonical Event start';
  end if;
  if body !~ 'pbos_notification_outbox' or body !~ 'pbos_notifications' then
    raise exception 'worker must materialize delivery through shared PBOS notification records';
  end if;
  if body !~ 'on conflict\(owner_id,event_key\) do nothing' or body !~ 'on conflict\(user_id,source_event_key\) do nothing' then
    raise exception 'worker notification materialization must remain idempotent';
  end if;
  if body !~ 'last_delivered_for_start=reminder\.starts_at' then
    raise exception 'worker must persist delivery start identity';
  end if;
end $$;

-- Reminder delivery may not mutate any other Event lifecycle/evidence authority.
do $$
declare body text;
begin
  select lower(pg_get_functiondef('private.process_due_event_reminders()'::regprocedure)) into body;
  if body ~ '\m(update|insert|delete)\M\s+(into\s+)?public\.community_event_rsvps'
     or body ~ '\m(update|insert|delete)\M\s+(into\s+)?public\.community_event_checkins'
     or body ~ '\m(update|insert|delete)\M\s+(into\s+)?public\.community_event_attendance'
     or body ~ 'record_learning_reward'
     or body ~ '\m(update|insert|delete)\M\s+(into\s+)?public\.community_events' then
    raise exception 'Event reminder worker must not mutate Event, RSVP, arrival, attendance, or reward authority';
  end if;
end $$;

-- Reminder notification projection must remain narrow and event-deep-linked.
do $$
declare body text;
begin
  select lower(pg_get_functiondef('private.process_due_event_reminders()'::regprocedure)) into body;
  if body !~ '''event_reminder''' or body !~ '''/events/'' \|\| reminder\.event_id::text' then
    raise exception 'Event reminder notification type/deep link changed';
  end if;
  if body ~ '\m(email|phone|guardian|household|transcript|verification_note)\M' then
    raise exception 'Event reminder worker contains restricted personal fields';
  end if;
end $$;

-- Migrations never seed fake subscriptions or notification data.
do $$
begin
  if exists(select 1 from public.community_event_reminders) then
    raise exception 'Event reminder migration must not seed subscription rows';
  end if;
end $$;

rollback;
