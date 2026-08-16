-- Move cross-user verification review authority out of the exposed public SECURITY DEFINER surface.
-- Public RPC signatures remain stable as SECURITY INVOKER wrappers. Private helpers retain the
-- reviewer guard, row locks, allowlisted transitions, audit event write, and role-scope mutations.

create or replace function private.get_verification_review_queue()
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
  select 'coach', r.id, r.coach_user_id, r.status, r.submitted_at,
         jsonb_strip_nulls(to_jsonb(r) - array['id','coach_user_id','status','submitted_at','reviewed_at','review_notes','created_at','updated_at'])
    from public.coach_verification_requests r
   where r.status in ('pending','under_review')
  union all
  select 'educator', r.id, r.educator_user_id, r.status, r.submitted_at,
         jsonb_strip_nulls(to_jsonb(r) - array['id','educator_user_id','status','submitted_at','reviewed_at','review_notes','created_at','updated_at'])
    from public.educator_verification_requests r
   where r.status in ('pending','under_review')
  union all
  select 'counselor', r.id, r.counselor_user_id, r.status, r.submitted_at,
         jsonb_strip_nulls(to_jsonb(r) - array['id','counselor_user_id','status','submitted_at','reviewed_at','review_notes','created_at','updated_at'])
    from public.counselor_verification_requests r
   where r.status in ('pending','under_review')
  union all
  select 'district', r.id, r.administrator_user_id, r.status, r.submitted_at,
         jsonb_strip_nulls(to_jsonb(r) - array['id','administrator_user_id','status','submitted_at','reviewed_at','review_notes','created_at','updated_at'])
    from public.district_verification_requests r
   where r.status in ('pending','under_review')
  union all
  select 'recruiting', r.id, r.recruiter_user_id, r.status, r.submitted_at,
         jsonb_strip_nulls(to_jsonb(r) - array['id','recruiter_user_id','status','submitted_at','reviewed_at','review_notes','created_at','updated_at'])
    from public.recruiting_verification_requests r
   where r.status in ('pending','under_review')
  union all
  select 'admissions', r.id, r.admissions_user_id, r.status, r.submitted_at,
         jsonb_strip_nulls(to_jsonb(r) - array['id','admissions_user_id','status','submitted_at','reviewed_at','review_notes','created_at','updated_at'])
    from public.admissions_verification_requests r
   where r.status in ('pending','under_review')
  union all
  select 'employer', r.id, r.employer_user_id, r.status, r.submitted_at,
         jsonb_strip_nulls(to_jsonb(r) - array['id','employer_user_id','status','submitted_at','reviewed_at','review_notes','created_at','updated_at'])
    from public.employer_verification_requests r
   where r.status in ('pending','under_review')
  union all
  select 'brand-partner', r.id, r.brand_user_id, r.status, r.submitted_at,
         jsonb_strip_nulls(to_jsonb(r) - array['id','brand_user_id','status','submitted_at','reviewed_at','review_notes','created_at','updated_at'])
    from public.brand_partner_verification_requests r
   where r.status in ('pending','under_review')
  union all
  select 'community-partner', r.id, r.partner_user_id, r.status, r.submitted_at,
         jsonb_strip_nulls(to_jsonb(r) - array['id','partner_user_id','status','submitted_at','reviewed_at','review_notes','created_at','updated_at'])
    from public.community_partner_verification_requests r
   where r.status in ('pending','under_review')
  union all
  select 'athlete-abroad', r.id, r.athlete_user_id, r.review_status, r.submitted_at,
         jsonb_strip_nulls(to_jsonb(r) - array['id','athlete_user_id','review_status','submitted_at','reviewed_at','review_notes','created_at','updated_at'])
    from public.athlete_abroad_readiness_reviews r
   where r.review_status in ('pending','under_review')
  order by submitted_at asc;
end;
$$;

create or replace function private.review_verification_request(
  requested_type text,
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
  subject_id uuid;
  old_status text;
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

  case requested_type
    when 'coach' then
      select coach_user_id, status into subject_id, old_status from public.coach_verification_requests where id = requested_id for update;
      if old_status not in ('pending','under_review') then raise exception 'request is not reviewable'; end if;
      update public.coach_verification_requests set status=requested_decision, reviewed_at=final_at, review_notes=normalized_notes, updated_at=now() where id=requested_id;
    when 'educator' then
      select educator_user_id, status into subject_id, old_status from public.educator_verification_requests where id = requested_id for update;
      if old_status not in ('pending','under_review') then raise exception 'request is not reviewable'; end if;
      update public.educator_verification_requests set status=requested_decision, reviewed_at=final_at, review_notes=normalized_notes, updated_at=now() where id=requested_id;
    when 'counselor' then
      select counselor_user_id, status into subject_id, old_status from public.counselor_verification_requests where id = requested_id for update;
      if old_status not in ('pending','under_review') then raise exception 'request is not reviewable'; end if;
      update public.counselor_verification_requests set status=requested_decision, reviewed_at=final_at, review_notes=normalized_notes, updated_at=now() where id=requested_id;
    when 'district' then
      select administrator_user_id, status into subject_id, old_status from public.district_verification_requests where id = requested_id for update;
      if old_status not in ('pending','under_review') then raise exception 'request is not reviewable'; end if;
      update public.district_verification_requests set status=requested_decision, reviewed_at=final_at, review_notes=normalized_notes, updated_at=now() where id=requested_id;
    when 'recruiting' then
      select recruiter_user_id, status into subject_id, old_status from public.recruiting_verification_requests where id = requested_id for update;
      if old_status not in ('pending','under_review') then raise exception 'request is not reviewable'; end if;
      update public.recruiting_verification_requests set status=requested_decision, reviewed_at=final_at, review_notes=normalized_notes, updated_at=now() where id=requested_id;
    when 'admissions' then
      select admissions_user_id, status into subject_id, old_status from public.admissions_verification_requests where id = requested_id for update;
      if old_status not in ('pending','under_review') then raise exception 'request is not reviewable'; end if;
      update public.admissions_verification_requests set status=requested_decision, reviewed_at=final_at, review_notes=normalized_notes, updated_at=now() where id=requested_id;
    when 'employer' then
      select employer_user_id, status into subject_id, old_status from public.employer_verification_requests where id = requested_id for update;
      if old_status not in ('pending','under_review') then raise exception 'request is not reviewable'; end if;
      update public.employer_verification_requests set status=requested_decision, reviewed_at=final_at, review_notes=normalized_notes, updated_at=now() where id=requested_id;
    when 'brand-partner' then
      select brand_user_id, status into subject_id, old_status from public.brand_partner_verification_requests where id = requested_id for update;
      if old_status not in ('pending','under_review') then raise exception 'request is not reviewable'; end if;
      update public.brand_partner_verification_requests
         set status=requested_decision,
             campaign_scope_approved=(requested_decision='approved'),
             compliance_scope_approved=(requested_decision='approved'),
             reviewed_at=final_at, review_notes=normalized_notes, updated_at=now()
       where id=requested_id;
    when 'community-partner' then
      select partner_user_id, status into subject_id, old_status from public.community_partner_verification_requests where id = requested_id for update;
      if old_status not in ('pending','under_review') then raise exception 'request is not reviewable'; end if;
      update public.community_partner_verification_requests
         set status=requested_decision,
             service_scope_status=case when requested_decision='approved' then 'approved' when requested_decision='rejected' then 'rejected' else 'pending' end,
             reviewed_at=final_at, review_notes=normalized_notes, updated_at=now()
       where id=requested_id;
    when 'athlete-abroad' then
      select athlete_user_id, review_status into subject_id, old_status from public.athlete_abroad_readiness_reviews where id = requested_id for update;
      if old_status not in ('pending','under_review') then raise exception 'request is not reviewable'; end if;
      update public.athlete_abroad_readiness_reviews
         set review_status=requested_decision,
             jurisdiction_scope_status=case when requested_decision='approved' then 'approved' when requested_decision='rejected' then 'rejected' else 'pending' end,
             reviewed_at=final_at, review_notes=normalized_notes, updated_at=now()
       where id=requested_id;
    else
      raise exception 'unsupported verification request type' using errcode = '22023';
  end case;

  if subject_id is null then
    raise exception 'verification request not found' using errcode = 'P0002';
  end if;

  if subject_id = reviewer_id then
    raise exception 'reviewers cannot approve their own verification request' using errcode = '42501';
  end if;

  insert into public.verification_review_events (
    request_type, request_id, subject_user_id, reviewer_user_id,
    previous_status, new_status, review_notes
  ) values (
    requested_type, requested_id, subject_id, reviewer_id,
    old_status, requested_decision, normalized_notes
  );

  return jsonb_build_object(
    'ok', true,
    'requestType', requested_type,
    'requestId', requested_id,
    'subjectUserId', subject_id,
    'previousStatus', old_status,
    'status', requested_decision,
    'reviewerUserId', reviewer_id
  );
end;
$$;

revoke all on function private.get_verification_review_queue() from public, anon, authenticated;
revoke all on function private.review_verification_request(text,uuid,text,text) from public, anon, authenticated;
grant execute on function private.get_verification_review_queue() to authenticated;
grant execute on function private.review_verification_request(text,uuid,text,text) to authenticated;

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
  select * from private.get_verification_review_queue();
$$;

create or replace function public.review_verification_request(
  requested_type text,
  requested_id uuid,
  requested_decision text,
  requested_notes text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.review_verification_request(requested_type, requested_id, requested_decision, requested_notes);
$$;

revoke all on function public.get_verification_review_queue() from public, anon, authenticated;
revoke all on function public.review_verification_request(text,uuid,text,text) from public, anon, authenticated;
grant execute on function public.get_verification_review_queue() to authenticated;
grant execute on function public.review_verification_request(text,uuid,text,text) to authenticated;

comment on function public.review_verification_request(text,uuid,text,text) is
  'Authenticated Founder/Admin wrapper for allowlisted human verification review. Final decisions require a recorded reason; privileged mutation logic remains private.';
