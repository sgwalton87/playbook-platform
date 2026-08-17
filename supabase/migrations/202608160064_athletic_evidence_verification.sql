create table if not exists public.athlete_evidence_verification_requests (
  id uuid primary key default gen_random_uuid(),
  athlete_evidence_id uuid not null unique references public.athlete_evidence(id) on delete cascade,
  scholar_id uuid not null,
  status text not null default 'pending' check (status in ('pending','under_review','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists athlete_evidence_verification_scholar_idx
  on public.athlete_evidence_verification_requests (scholar_id, submitted_at desc);
create index if not exists athlete_evidence_verification_status_idx
  on public.athlete_evidence_verification_requests (status, submitted_at asc);

alter table public.athlete_evidence_verification_requests enable row level security;
revoke all on public.athlete_evidence_verification_requests from anon, authenticated;
grant select on public.athlete_evidence_verification_requests to authenticated;

drop policy if exists athlete_evidence_verification_owner_select on public.athlete_evidence_verification_requests;
create policy athlete_evidence_verification_owner_select
  on public.athlete_evidence_verification_requests
  for select
  to authenticated
  using ((select auth.uid()) = scholar_id);

create or replace function private.request_athlete_evidence_verification(requested_evidence_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  evidence_row public.athlete_evidence%rowtype;
  request_row public.athlete_evidence_verification_requests%rowtype;
begin
  if caller_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select * into evidence_row
    from public.athlete_evidence
   where id = requested_evidence_id
   for update;

  if evidence_row.id is null then
    raise exception 'athletic evidence not found' using errcode = 'P0002';
  end if;

  if evidence_row.scholar_id <> caller_id then
    raise exception 'only the Scholar owner may request athletic evidence verification' using errcode = '42501';
  end if;

  if evidence_row.verification_state <> 'self_reported' then
    raise exception 'athletic evidence is not eligible for verification submission' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.athlete_evidence ae
     where ae.supersedes_evidence_id = evidence_row.id
  ) then
    raise exception 'superseded athletic evidence cannot be submitted for verification' using errcode = '22023';
  end if;

  insert into public.athlete_evidence_verification_requests (
    athlete_evidence_id, scholar_id
  ) values (
    evidence_row.id, caller_id
  )
  returning * into request_row;

  update public.athlete_evidence
     set verification_state = 'submitted'
   where id = evidence_row.id;

  return jsonb_build_object(
    'ok', true,
    'requestId', request_row.id,
    'evidenceId', evidence_row.id,
    'status', request_row.status,
    'scholarId', caller_id
  );
end;
$$;

revoke all on function private.request_athlete_evidence_verification(uuid) from public, anon, authenticated;
grant execute on function private.request_athlete_evidence_verification(uuid) to authenticated;

create or replace function public.request_athlete_evidence_verification(requested_evidence_id uuid)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.request_athlete_evidence_verification(requested_evidence_id);
$$;

revoke all on function public.request_athlete_evidence_verification(uuid) from public, anon, authenticated;
grant execute on function public.request_athlete_evidence_verification(uuid) to authenticated;

create or replace function private.get_athlete_evidence_review_queue()
returns table (
  request_type text,
  request_id uuid,
  subject_user_id uuid,
  status text,
  submitted_at timestamptz,
  evidence jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.current_user_is_verification_reviewer() then
    raise exception 'verification reviewer authority required' using errcode = '42501';
  end if;

  return query
  select
    'athlete-evidence'::text,
    r.id,
    r.scholar_id,
    r.status,
    r.submitted_at,
    jsonb_strip_nulls(jsonb_build_object(
      'athleteEvidenceId', e.id,
      'sport', e.sport,
      'category', e.category,
      'metricName', e.metric_name,
      'valueText', e.value_text,
      'valueNumeric', e.value_numeric,
      'unit', e.unit,
      'observedAt', e.observed_at,
      'sourceType', e.source_type,
      'sourceLabel', e.source_label,
      'sourceUrl', e.source_url,
      'provenance', e.provenance
    ))
  from public.athlete_evidence_verification_requests r
  join public.athlete_evidence e on e.id = r.athlete_evidence_id
  where r.status in ('pending','under_review')
  order by r.submitted_at asc;
end;
$$;

revoke all on function private.get_athlete_evidence_review_queue() from public, anon, authenticated;
grant execute on function private.get_athlete_evidence_review_queue() to authenticated;

create or replace function private.review_athlete_evidence_request(
  requested_id uuid,
  requested_decision text,
  requested_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  reviewer_id uuid := auth.uid();
  request_row public.athlete_evidence_verification_requests%rowtype;
  normalized_notes text := nullif(left(trim(coalesce(requested_notes, '')), 4000), '');
  final_at timestamptz := case when requested_decision in ('approved','rejected') then now() else null end;
begin
  if reviewer_id is null or not private.current_user_is_verification_reviewer() then
    raise exception 'verification reviewer authority required' using errcode = '42501';
  end if;

  if requested_decision not in ('under_review','approved','rejected') then
    raise exception 'invalid verification decision' using errcode = '22023';
  end if;

  if requested_decision in ('approved','rejected') and normalized_notes is null then
    raise exception 'a decision reason is required for approval or rejection' using errcode = '22023';
  end if;

  select * into request_row
    from public.athlete_evidence_verification_requests
   where id = requested_id
   for update;

  if request_row.id is null then
    raise exception 'verification request not found' using errcode = 'P0002';
  end if;

  if request_row.status not in ('pending','under_review') then
    raise exception 'request is not reviewable' using errcode = '22023';
  end if;

  if request_row.scholar_id = reviewer_id then
    raise exception 'reviewers cannot approve their own verification request' using errcode = '42501';
  end if;

  update public.athlete_evidence_verification_requests
     set status = requested_decision,
         reviewed_at = final_at,
         review_notes = normalized_notes,
         updated_at = now()
   where id = request_row.id;

  if requested_decision = 'approved' then
    update public.athlete_evidence
       set verification_state = 'verified',
           verified_by = reviewer_id,
           verified_at = final_at,
           verification_note = normalized_notes
     where id = request_row.athlete_evidence_id
       and scholar_id = request_row.scholar_id;
  elsif requested_decision = 'rejected' then
    update public.athlete_evidence
       set verification_state = 'rejected',
           verified_by = reviewer_id,
           verified_at = final_at,
           verification_note = normalized_notes
     where id = request_row.athlete_evidence_id
       and scholar_id = request_row.scholar_id;
  end if;

  insert into public.verification_review_events (
    request_type, request_id, subject_user_id, reviewer_user_id,
    previous_status, new_status, review_notes
  ) values (
    'athlete-evidence', request_row.id, request_row.scholar_id, reviewer_id,
    request_row.status, requested_decision, normalized_notes
  );

  return jsonb_build_object(
    'ok', true,
    'requestType', 'athlete-evidence',
    'requestId', request_row.id,
    'subjectUserId', request_row.scholar_id,
    'previousStatus', request_row.status,
    'status', requested_decision,
    'reviewerUserId', reviewer_id,
    'evidenceId', request_row.athlete_evidence_id
  );
end;
$$;

revoke all on function private.review_athlete_evidence_request(uuid,text,text) from public, anon, authenticated;
grant execute on function private.review_athlete_evidence_request(uuid,text,text) to authenticated;

create or replace function public.get_verification_review_queue()
returns table (
  request_type text,
  request_id uuid,
  subject_user_id uuid,
  status text,
  submitted_at timestamptz,
  evidence jsonb
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_verification_review_queue()
  union all
  select * from private.get_athlete_evidence_review_queue()
  order by submitted_at asc;
$$;

create or replace function public.review_verification_request(
  requested_type text,
  requested_id uuid,
  requested_decision text,
  requested_notes text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if requested_type = 'athlete-evidence' then
    return private.review_athlete_evidence_request(
      requested_id,
      requested_decision,
      requested_notes
    );
  end if;

  return private.review_verification_request(
    requested_type,
    requested_id,
    requested_decision,
    requested_notes
  );
end;
$$;

revoke all on function public.get_verification_review_queue() from public, anon, authenticated;
revoke all on function public.review_verification_request(text,uuid,text,text) from public, anon, authenticated;
grant execute on function public.get_verification_review_queue() to authenticated;
grant execute on function public.review_verification_request(text,uuid,text,text) to authenticated;

comment on table public.athlete_evidence_verification_requests is
  'Governed requests for independent review of Scholar-owned athletic evidence. Requests flow through the shared Founder/Admin verification review center.';
comment on function public.request_athlete_evidence_verification(uuid) is
  'Scholar-owner request wrapper that moves eligible self-reported athletic evidence into submitted state for independent review.';
