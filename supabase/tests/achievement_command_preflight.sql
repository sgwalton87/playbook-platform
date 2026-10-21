\set ON_ERROR_STOP on
begin;
do $$
begin
  if has_function_privilege('anon','public.create_achievement_with_evidence(uuid,uuid,jsonb)','EXECUTE')
    or has_function_privilege('anon','private.create_achievement_with_evidence(uuid,uuid,jsonb)','EXECUTE') then
    raise exception 'Anonymous achievement command execution is exposed';
  end if;
  if not has_function_privilege('authenticated','public.create_achievement_with_evidence(uuid,uuid,jsonb)','EXECUTE') then
    raise exception 'Authenticated achievement command is unavailable';
  end if;
  if has_table_privilege('authenticated','private.achievement_command_receipts','SELECT,INSERT,UPDATE,DELETE')
    or has_table_privilege('anon','private.achievement_command_receipts','SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'Private command receipts are exposed';
  end if;
  if (select prosecdef from pg_proc where oid='public.create_achievement_with_evidence(uuid,uuid,jsonb)'::regprocedure) then
    raise exception 'Public wrapper must remain security invoker';
  end if;
end;
$$;
insert into auth.users(id,email) values
 ('00000000-0000-0000-0000-00000000ac01','achievement-command@example.invalid'),
 ('00000000-0000-0000-0000-00000000ac02','achievement-other@example.invalid');
insert into public.profiles(id,username) values
 ('00000000-0000-0000-0000-00000000ac01','achievement-command'),
 ('00000000-0000-0000-0000-00000000ac02','achievement-other') on conflict(id) do nothing;
-- This failure occurs after the achievement, pack, evidence and reflection inserts.
create function pg_temp.reject_achievement_timeline() returns trigger language plpgsql as $$
begin
  if new.created_by='00000000-0000-0000-0000-00000000ac01'::uuid then
    raise exception 'achievement preflight injected failure' using errcode='23514';
  end if;
  return new;
end;
$$;
create trigger achievement_preflight_reject before insert on public.timeline_events
 for each row execute function pg_temp.reject_achievement_timeline();
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000ac01',true);
do $$
begin
  begin
    perform public.create_achievement_with_evidence('00000000-0000-0000-0000-00000000ac03',
      '00000000-0000-0000-0000-00000000ac01',
      '{"title":"Preflight achievement","category":"service","evidenceUrl":"https://example.invalid/proof","reflection":"Preflight reflection"}');
    raise exception 'Expected injected write failure';
  exception when check_violation then
    if sqlerrm <> 'achievement preflight injected failure' then raise; end if;
  end;
end;
$$;
reset role;
do $$
begin
  if exists(select 1 from public.playbook_records where profile_id='00000000-0000-0000-0000-00000000ac01')
    or exists(select 1 from private.achievement_command_receipts where actor_id='00000000-0000-0000-0000-00000000ac01') then
    raise exception 'Failed achievement command retained partial state';
  end if;
end;
$$;
drop trigger achievement_preflight_reject on public.timeline_events;
set local role authenticated;
do $$
declare first_id uuid; retry_id uuid;
begin
  select id into first_id from public.create_achievement_with_evidence('00000000-0000-0000-0000-00000000ac03',
    '00000000-0000-0000-0000-00000000ac01','{"title":"Preflight achievement","category":"service"}');
  select id into retry_id from public.create_achievement_with_evidence('00000000-0000-0000-0000-00000000ac03',
    '00000000-0000-0000-0000-00000000ac01','{"title":"Preflight achievement","category":"service"}');
  if first_id is null or retry_id is distinct from first_id then raise exception 'Retry created another achievement'; end if;
  begin
    perform public.create_achievement_with_evidence('00000000-0000-0000-0000-00000000ac03',
      '00000000-0000-0000-0000-00000000ac01','{"title":"Changed"}');
    raise exception 'Conflicting command content was accepted';
  exception when invalid_parameter_value then null; end;
  begin
    perform public.create_achievement_with_evidence('00000000-0000-0000-0000-00000000ac04',
      '00000000-0000-0000-0000-00000000ac02','{"title":"Other owner"}');
    raise exception 'Cross-owner achievement was accepted';
  exception when insufficient_privilege then null; end;
end;
$$;
reset role;
do $$
begin
  if (select count(*) from public.achievements a join public.playbook_records r on r.id=a.record_id
    where r.profile_id='00000000-0000-0000-0000-00000000ac01') <> 1
    or (select count(*) from private.achievement_command_receipts where actor_id='00000000-0000-0000-0000-00000000ac01') <> 1 then
    raise exception 'Achievement replay did not retain exactly one result';
  end if;
end;
$$;
rollback;
