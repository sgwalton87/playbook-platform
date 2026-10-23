
-- Replace the older recommender policy that calls a globally revoked private
-- helper. Verify the onboarded learner against the caller's own profile without
-- granting execution of that helper to all authenticated users.
drop policy if exists "Learners can manage own recommender requests" on public.recommender_requests;
create policy "Learners can manage own recommender requests"
on public.recommender_requests for all to authenticated
using (
  scholar_id = (select auth.uid())
  and exists (select 1 from public.profiles p
    where p.id = (select auth.uid())
      and coalesce(p.profile_mode,p.role) in ('scholar','scholar-athlete','transition-youth')
      and p.onboarding_completed is true)
)
with check (
  scholar_id = (select auth.uid())
  and exists (select 1 from public.profiles p
    where p.id = (select auth.uid())
      and coalesce(p.profile_mode,p.role) in ('scholar','scholar-athlete','transition-youth')
      and p.onboarding_completed is true)
);

-- Existing learner-wide UPDATE permission would otherwise let a requester rewrite
-- the recommender email after sending. Freeze recipient/owner/evidence/letter fields
-- at the SQL grant boundary; only legacy request status may be updated by clients.
revoke update on public.recommender_requests from public, authenticated;
grant update (status) on public.recommender_requests to authenticated;
drop policy if exists "SJ07 requester status may only be draft or sent" on public.recommender_requests;
create policy "SJ07 requester status may only be draft or sent"
  on public.recommender_requests as restrictive
  for update to authenticated
  using (scholar_id=auth.uid())
  with check (status in ('draft','sent'));
drop policy if exists "SJ07 requests start without submitted evidence" on public.recommender_requests;
create policy "SJ07 requests start without submitted evidence"
  on public.recommender_requests as restrictive
  for insert to authenticated
  with check (status='draft' and letter_text is null and approved_at is null);

-- SJ-07: governed recommendation submission, private Vault metadata and application attachment.
-- NOT PRODUCTION AUTHORIZED. Test in disposable Supabase before founder approval.
-- Existing recommender_requests remains the sole request authority.
create table if not exists public.recommendation_letter_artifacts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.recommender_requests(id) on delete restrict,
  scholar_id uuid not null references public.profiles(id) on delete restrict,
  recommender_id uuid not null references auth.users(id) on delete restrict,
  confidentiality text not null check (confidentiality in ('open','confidential')),
  letter_text text not null check (length(letter_text) between 100 and 20000),
  sha256 text not null,
  submitted_at timestamptz not null default now(),
  constraint recommendation_artifact_digest check (sha256 ~ '^[0-9a-f]{64}$')
);
alter table public.recommendation_letter_artifacts enable row level security;
revoke all on public.recommendation_letter_artifacts from public, anon, authenticated;
-- No client SQL SELECT at all, even for the Scholar; use exact-scoped RPC below.

create or replace function public.submit_recommendation_letter(
  p_request_id uuid, p_letter text, p_confidentiality text
) returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  r public.recommender_requests%rowtype;
  v_id uuid;
  v_record uuid;
  v_user_email text;
begin
  if auth.uid() is null or p_confidentiality not in ('open','confidential')
    or length(trim(coalesce(p_letter,''))) not between 100 and 20000 then
    raise exception 'Invalid recommendation submission' using errcode='42501';
  end if;
  -- Require a confirmed account: an invitation or address string is not authentication.
  select lower(u.email) into v_user_email from auth.users u
    where u.id=auth.uid() and u.email_confirmed_at is not null;
  if v_user_email is null then
    raise exception 'Verified recommender identity required' using errcode='42501';
  end if;
  select * into r from public.recommender_requests where id=p_request_id for update;
  if not found or lower(trim(r.recommender_email)) <> v_user_email
    or r.scholar_id=auth.uid() or r.status not in ('sent','viewed','in_progress') then
    raise exception 'Recommendation request authorization denied' using errcode='42501';
  end if;
  select id into v_record from public.playbook_records
    where profile_id=r.scholar_id and deleted_at is null and status='active'
    order by created_at asc limit 1;
  if v_record is null then
    raise exception 'Scholar Record required before Vault submission';
  end if;
  insert into public.recommendation_letter_artifacts
    (request_id,scholar_id,recommender_id,confidentiality,letter_text,sha256)
    values(p_request_id,r.scholar_id,auth.uid(),p_confidentiality,trim(p_letter),
    encode(pg_catalog.sha256(pg_catalog.convert_to(trim(p_letter),'UTF8')),'hex'))
    returning id into v_id;
  -- Metadata only; NEVER include confidential letter text or storage URLs here.
  insert into public.scholar_vault_items
    (record_id,item_type,title,description,visibility,metadata,created_by)
  values(v_record,'recommendation','Recommendation from ' || left(r.recommender_name,120),
    'Applications & Career / Recommendations','private',
    jsonb_build_object('folder','Applications & Career / Recommendations',
      'artifact_id',v_id,'request_id',p_request_id,'confidentiality',p_confidentiality,
      'status','submitted','submitted_at',now()),r.scholar_id);
  update public.recommender_requests set status='submitted' where id=p_request_id;
  return v_id;
end; $$;
revoke all on function public.submit_recommendation_letter(uuid,text,text) from public, anon;
grant execute on function public.submit_recommendation_letter(uuid,text,text) to authenticated;

create or replace function public.read_open_recommendation_letter(p_artifact_id uuid)
returns table (artifact_id uuid, letter_text text, recommender_name text, submitted_at timestamptz)
language plpgsql security definer set search_path=''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode='42501';
  end if;
  return query select a.id,a.letter_text,r.recommender_name,a.submitted_at
  from public.recommendation_letter_artifacts a
  join public.recommender_requests r on r.id=a.request_id
  where a.id=p_artifact_id and a.scholar_id=auth.uid() and a.confidentiality='open';
end; $$;
revoke all on function public.read_open_recommendation_letter(uuid) from public, anon;
grant execute on function public.read_open_recommendation_letter(uuid) to authenticated;

create or replace function public.attach_recommendation_to_application(
  p_workspace_id uuid, p_request_id uuid
) returns void language plpgsql security definer set search_path=''
as $$
declare v_owner uuid; v_ids jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode='42501';
  end if;
  select scholar_id,coalesce(recommendation_request_ids,'[]'::jsonb)
    into v_owner,v_ids from public.application_workspaces
    where id=p_workspace_id for update;
  if v_owner is distinct from auth.uid() then
    raise exception 'Application workspace authorization denied' using errcode='42501';
  end if;
  if not exists (select 1 from public.recommendation_letter_artifacts a
    where a.request_id=p_request_id and a.scholar_id=auth.uid()) then
    raise exception 'Completed owned recommendation required' using errcode='42501';
  end if;
  if not (v_ids @> jsonb_build_array(p_request_id::text)) then
    update public.application_workspaces
      set recommendation_request_ids=v_ids || jsonb_build_array(p_request_id::text)
    where id=p_workspace_id;
  end if;
  -- Attachment saves only request reference. Confidential content never goes to packet JSON.
end; $$;
revoke all on function public.attach_recommendation_to_application(uuid,uuid) from public, anon;
grant execute on function public.attach_recommendation_to_application(uuid,uuid) to authenticated;

-- Only a real recommender-submitted artifact is eligible for the Vault folder.
-- Never trust editable scholar_vault_items metadata as proof of submission.
create or replace function public.list_submitted_recommendation_vault()
returns table (vault_id uuid,artifact_id uuid,request_id uuid,title text,confidentiality text,submitted_at timestamptz)
language plpgsql security definer set search_path=''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode='42501';
  end if;
  return query
    select v.id,a.id,a.request_id,v.title,a.confidentiality,a.submitted_at
    from public.recommendation_letter_artifacts a
    join public.recommender_requests r on r.id=a.request_id
    join public.playbook_records pr on pr.profile_id=a.scholar_id and pr.deleted_at is null
    join public.scholar_vault_items v on v.record_id=pr.id
      and v.deleted_at is null and v.item_type='recommendation'
      and v.metadata->>'artifact_id'=a.id::text
      and v.metadata->>'request_id'=a.request_id::text
    where a.scholar_id=auth.uid()
    order by a.submitted_at desc;
end; $$;
revoke all on function public.list_submitted_recommendation_vault() from public, anon;
grant execute on function public.list_submitted_recommendation_vault() to authenticated;

-- Application packet creation must obey the same owner/onboarded learner gate.
-- The older application-workspaces-own policy invokes a globally revoked helper,
-- which denies a legitimate Scholar in the isolated end-to-end journey.
drop policy if exists "application-workspaces-own" on public.application_workspaces;
create policy "application-workspaces-own"
on public.application_workspaces for all to authenticated
using (
  scholar_id = (select auth.uid())
  and exists (select 1 from public.profiles p
    where p.id=(select auth.uid())
      and coalesce(p.profile_mode,p.role) in ('scholar','scholar-athlete','transition-youth')
      and p.onboarding_completed is true)
)
with check (
  scholar_id = (select auth.uid())
  and exists (select 1 from public.profiles p
    where p.id=(select auth.uid())
      and coalesce(p.profile_mode,p.role) in ('scholar','scholar-athlete','transition-youth')
      and p.onboarding_completed is true)
);
