-- Transactional command candidate. No hosted application is implied by this file.
create schema if not exists private;
create table private.achievement_command_receipts (
  actor_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid not null,
  payload_hash bytea not null,
  achievement_id uuid references public.achievements(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (actor_id, request_id)
);
alter table private.achievement_command_receipts enable row level security;
revoke all on private.achievement_command_receipts from public, anon, authenticated;

create function private.create_achievement_with_evidence(request_id uuid, requested_profile_id uuid, payload jsonb)
returns public.achievements
language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  canonical_record public.playbook_records;
  achievement public.achievements;
  receipt private.achievement_command_receipts;
  command jsonb;
  record_count integer;
begin
  if actor is null or actor is distinct from requested_profile_id then
    raise exception 'Achievement owner does not match authenticated user' using errcode = '42501';
  end if;
  if request_id is null or payload is null or jsonb_typeof(payload) <> 'object' then
    raise exception 'Request identifier and object payload are required' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_object_keys(payload) as k(key)
    where key not in ('title','category','description','evidenceTitle','evidenceUrl','reflection')) then
    raise exception 'Unsupported achievement fields' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_each(payload) as p(key,value)
    where jsonb_typeof(value) not in ('string','null')) then
    raise exception 'Achievement fields must be strings' using errcode = '22023';
  end if;
  command := jsonb_build_object(
    'title', nullif(btrim(payload->>'title'), ''),
    'category', coalesce(nullif(payload->>'category',''), 'other'),
    'description', nullif(payload->>'description',''),
    'evidenceTitle', nullif(payload->>'evidenceTitle',''),
    'evidenceUrl', nullif(btrim(payload->>'evidenceUrl'),''),
    'reflection', nullif(payload->>'reflection','')
  );
  if command->>'title' is null or length(command->>'title') > 500
    or length(command->>'description') > 20000 or length(command->>'reflection') > 20000
    or length(command->>'evidenceTitle') > 500 or length(command->>'evidenceUrl') > 2048 then
    raise exception 'Invalid achievement field length' using errcode = '22023';
  end if;
  if command->>'evidenceUrl' is not null and command->>'evidenceUrl' !~* '^https?://[^[:space:]]+$' then
    raise exception 'Evidence URL must use HTTP or HTTPS' using errcode = '22023';
  end if;
  -- Serialize commands for this owner, including different request IDs creating a first record.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text, 0));
  select * into receipt from private.achievement_command_receipts r
    where r.actor_id = actor and r.request_id = create_achievement_with_evidence.request_id;
  if found then
    if receipt.payload_hash is distinct from pg_catalog.sha256(pg_catalog.convert_to(command::text, 'UTF8')) then
      raise exception 'Request identifier was already used with different content' using errcode = '22023';
    end if;
    select a.* into achievement from public.achievements a
      join public.playbook_records r on r.id = a.record_id
      where a.id = receipt.achievement_id and r.profile_id = actor
        and a.deleted_at is null and r.deleted_at is null;
    if not found then
      raise exception 'Previously created achievement is no longer available' using errcode = '55000';
    end if;
    return achievement;
  end if;
  select count(*) into record_count from public.playbook_records r
    where r.profile_id = actor and r.deleted_at is null;
  if record_count > 1 then
    raise exception 'Multiple canonical records require reconciliation' using errcode = '55000';
  end if;
  select r.* into canonical_record from public.playbook_records r
    where r.profile_id = actor and r.deleted_at is null for update;
  if not found then
    insert into public.playbook_records(profile_id,created_by,updated_by)
      values(actor,actor,actor) returning * into canonical_record;
  elsif canonical_record.status is distinct from 'active'::public.record_status then
    raise exception 'Canonical record is not active' using errcode = '55000';
  end if;
  insert into public.achievements(record_id,title,category,description,created_by,updated_by)
    values(canonical_record.id,command->>'title',(command->>'category')::public.achievement_category,
      command->>'description',actor,actor) returning * into achievement;
  insert into public.evidence_packs(achievement_id,title,summary,created_by,updated_by)
    values(achievement.id,(command->>'title') || ' Evidence Pack',command->>'description',actor,actor);
  if command->>'evidenceTitle' is not null or command->>'evidenceUrl' is not null then
    insert into public.evidence(achievement_id,title,evidence_type,url,created_by,updated_by)
      values(achievement.id,coalesce(command->>'evidenceTitle',command->>'title'),
        case when command->>'evidenceUrl' is null then 'other'::public.evidence_type else 'link'::public.evidence_type end,
        command->>'evidenceUrl',actor,actor);
  end if;
  if command->>'reflection' is not null then
    insert into public.reflections(achievement_id,response,created_by,updated_by)
      values(achievement.id,command->>'reflection',actor,actor);
  end if;
  insert into public.timeline_events(record_id,achievement_id,event_type,title,description,event_date,source,verified,created_by,updated_by)
    values(canonical_record.id,achievement.id,'achievement',command->>'title',command->>'description',now(),'achievement_workflow',false,actor,actor);
  insert into private.achievement_command_receipts(actor_id,request_id,payload_hash,achievement_id)
    values(actor,request_id,pg_catalog.sha256(pg_catalog.convert_to(command::text, 'UTF8')),achievement.id);
  return achievement;
end;
$$;
revoke all on function private.create_achievement_with_evidence(uuid,uuid,jsonb) from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.create_achievement_with_evidence(uuid,uuid,jsonb) to authenticated;
create function public.create_achievement_with_evidence(request_id uuid, requested_profile_id uuid, payload jsonb)
returns public.achievements language sql security invoker set search_path = ''
as $$ select private.create_achievement_with_evidence(request_id, requested_profile_id, payload); $$;
revoke all on function public.create_achievement_with_evidence(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.create_achievement_with_evidence(uuid,uuid,jsonb) to authenticated;
