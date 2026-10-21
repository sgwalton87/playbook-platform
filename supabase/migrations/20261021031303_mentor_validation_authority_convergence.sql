-- Restore the missing Mentor validation boundary without replacing the
-- current hardened claim_support_invitation implementation.
-- Scholar-invited Mentor validation.
-- Mentor acceptance creates a pending validation request, never immediate access.
-- Activation requires either one Parent/Guardian or Coach approval, or two
-- distinct active support-system members.

create table if not exists public.mentor_validation_requests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.support_invitations(id) on delete cascade,
  scholar_id uuid not null,
  mentor_user_id uuid not null,
  mentor_email text not null,
  mentor_name text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table if not exists public.mentor_validation_approvals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.mentor_validation_requests(id) on delete cascade,
  approver_relationship_id uuid not null references public.support_relationships(id) on delete restrict,
  approver_user_id uuid not null,
  relationship_snapshot text not null,
  created_at timestamptz not null default now(),
  unique (request_id, approver_user_id)
);

create index if not exists mentor_validation_requests_scholar_idx
  on public.mentor_validation_requests(scholar_id);
create index if not exists mentor_validation_requests_mentor_idx
  on public.mentor_validation_requests(mentor_user_id);
create index if not exists mentor_validation_approvals_request_idx
  on public.mentor_validation_approvals(request_id);

alter table public.mentor_validation_requests enable row level security;
alter table public.mentor_validation_approvals enable row level security;


drop policy if exists "Mentor validation participants can view requests"
  on public.mentor_validation_requests;
create policy "Mentor validation participants can view requests"
on public.mentor_validation_requests
for select
to authenticated
using (
  scholar_id = (select auth.uid())
  or mentor_user_id = (select auth.uid())
  or exists (
    select 1
      from public.support_relationships as relationship
     where relationship.scholar_id = mentor_validation_requests.scholar_id
       and relationship.supporter_id = (select auth.uid())
       and relationship.status = 'active'
  )
);


drop policy if exists "Mentor validation participants can view approvals"
  on public.mentor_validation_approvals;
create policy "Mentor validation participants can view approvals"
on public.mentor_validation_approvals
for select
to authenticated
using (
  exists (
    select 1
      from public.mentor_validation_requests as request
     where request.id = mentor_validation_approvals.request_id
       and (
         request.scholar_id = (select auth.uid())
         or request.mentor_user_id = (select auth.uid())
         or exists (
           select 1
             from public.support_relationships as viewer_relationship
            where viewer_relationship.scholar_id = request.scholar_id
              and viewer_relationship.supporter_id = (select auth.uid())
              and viewer_relationship.status = 'active'
         )
       )
  )
);


-- Requests are created only by the current private invitation claim function.
-- Approvals and activation are governed commands, never direct client writes.
drop policy if exists "Invited mentors can create validation requests" on public.mentor_validation_requests;
drop policy if exists "Validated mentors can mark requests approved" on public.mentor_validation_requests;
drop policy if exists "Active support members can validate mentors" on public.mentor_validation_approvals;
drop policy if exists "Validated mentors can activate invited support relationships" on public.support_relationships;
revoke all on public.mentor_validation_requests,public.mentor_validation_approvals from public,anon,authenticated;
grant select on public.mentor_validation_requests,public.mentor_validation_approvals to authenticated;

create or replace function private.approve_mentor_validation(validation_request_id uuid)
returns table(request_id uuid,approval_count bigint,privileged_validator boolean,threshold_met boolean)
language plpgsql security definer set search_path = '' as $$
declare
 actor uuid := auth.uid(); request_row public.mentor_validation_requests;
 relationship_row public.support_relationships; approvals_count bigint; has_privileged boolean;
begin
 if actor is null then raise exception 'Authentication required.' using errcode='42501'; end if;
 select r.* into request_row from public.mentor_validation_requests r where r.id=validation_request_id for update;
 if not found then raise exception 'Mentor validation request not found.' using errcode='P0002'; end if;
 if request_row.status<>'pending' then raise exception 'Mentor validation request is not pending.' using errcode='23505'; end if;
 if request_row.mentor_user_id=actor then raise exception 'A mentor candidate cannot validate their own request.' using errcode='42501'; end if;
 perform i.id from public.support_invitations i where i.id=request_row.invitation_id
   and i.scholar_id=request_row.scholar_id and i.relationship='mentor' and i.status='accepted'
   and i.invitee_user_id is null and lower(trim(i.invitee_email))=lower(trim(request_row.mentor_email)) for share;
 if not found then raise exception 'Mentor request does not match a governed accepted invitation.' using errcode='42501'; end if;
 select r.* into relationship_row from public.support_relationships r
   where r.scholar_id=request_row.scholar_id and r.supporter_id=actor and r.status='active'
   order by case when r.relationship='parent_guardian' then 0 when r.relationship='coach' then 1 else 2 end,r.created_at
   limit 1 for share;
 if not found then raise exception 'Only active members of this Scholar support system can validate a mentor.' using errcode='42501'; end if;
 insert into public.mentor_validation_approvals(request_id,approver_relationship_id,approver_user_id,relationship_snapshot)
   values(request_row.id,relationship_row.id,actor,relationship_row.relationship)
   on conflict on constraint mentor_validation_approvals_request_id_approver_user_id_key do nothing;
 select count(distinct a.approver_user_id),coalesce(bool_or(r.relationship in ('parent_guardian','coach')),false)
   into approvals_count,has_privileged from public.mentor_validation_approvals a
   join public.support_relationships r on r.id=a.approver_relationship_id and r.supporter_id=a.approver_user_id
     and r.scholar_id=request_row.scholar_id and r.status='active'
   where a.request_id=request_row.id and a.approver_user_id<>request_row.mentor_user_id;
 return query select request_row.id,approvals_count,has_privileged,(has_privileged or approvals_count>=2);
end;
$$;

create or replace function private.finalize_mentor_validation(validation_request_id uuid)
returns table(request_id uuid,scholar_id uuid,mentor_user_id uuid,status text)
language plpgsql security definer set search_path = '' as $$
declare
 actor uuid := auth.uid(); request_row public.mentor_validation_requests; approvals_count bigint; has_privileged boolean;
begin
 if actor is null then raise exception 'Authentication required.' using errcode='42501'; end if;
 select r.* into request_row from public.mentor_validation_requests r where r.id=validation_request_id for update;
 if not found then raise exception 'Mentor validation request not found.' using errcode='P0002'; end if;
 if request_row.mentor_user_id<>actor then raise exception 'Only the invited mentor can finalize this validation.' using errcode='42501'; end if;
 if request_row.status='approved' then
   perform r.id from public.support_relationships r where r.source_invitation_id=request_row.invitation_id
     and r.scholar_id=request_row.scholar_id and r.supporter_id=actor and r.relationship='mentor' and r.status='active' for share;
   if not found then raise exception 'Mentor relationship is no longer active.' using errcode='42501'; end if;
   return query select request_row.id,request_row.scholar_id,request_row.mentor_user_id,'approved'::text; return;
 end if;
 if request_row.status<>'pending' then raise exception 'Mentor validation request is not pending.' using errcode='23505'; end if;
 perform i.id from public.support_invitations i where i.id=request_row.invitation_id
   and i.scholar_id=request_row.scholar_id and i.relationship='mentor' and i.status='accepted'
   and i.invitee_user_id is null and lower(trim(i.invitee_email))=lower(trim(request_row.mentor_email)) for share;
 if not found then raise exception 'Mentor request does not match a governed accepted invitation.' using errcode='42501'; end if;
 -- Lock the current validating relationships so revocation and finalization serialize.
 perform r.id from public.support_relationships r join public.mentor_validation_approvals a
   on a.approver_relationship_id=r.id and a.approver_user_id=r.supporter_id
   where a.request_id=request_row.id and r.scholar_id=request_row.scholar_id and r.status='active'
     and a.approver_user_id<>actor for share of r;
 select count(distinct a.approver_user_id),coalesce(bool_or(r.relationship in ('parent_guardian','coach')),false)
   into approvals_count,has_privileged from public.mentor_validation_approvals a
   join public.support_relationships r on r.id=a.approver_relationship_id and r.supporter_id=a.approver_user_id
     and r.scholar_id=request_row.scholar_id and r.status='active'
   where a.request_id=request_row.id and a.approver_user_id<>actor;
 if not has_privileged and approvals_count<2 then raise exception 'Mentor validation threshold has not been met.' using errcode='42501'; end if;
 insert into public.support_relationships(scholar_id,supporter_id,supporter_email,supporter_name,relationship,permissions,source_invitation_id,status)
   values(request_row.scholar_id,actor,request_row.mentor_email,request_row.mentor_name,'mentor',
     '["view_progress","recommend_actions","support_tasks"]'::jsonb,request_row.invitation_id,'active');
 update public.mentor_validation_requests r set status='approved',approved_at=now() where r.id=request_row.id;
 return query select request_row.id,request_row.scholar_id,request_row.mentor_user_id,'approved'::text;
end;
$$;
revoke all on function private.approve_mentor_validation(uuid),private.finalize_mentor_validation(uuid) from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.approve_mentor_validation(uuid),private.finalize_mentor_validation(uuid) to authenticated;

create or replace function public.approve_mentor_validation(validation_request_id uuid)
returns table(request_id uuid,approval_count bigint,privileged_validator boolean,threshold_met boolean)
language sql security invoker set search_path = '' as $$ select * from private.approve_mentor_validation(validation_request_id); $$;
create or replace function public.finalize_mentor_validation(validation_request_id uuid)
returns table(request_id uuid,scholar_id uuid,mentor_user_id uuid,status text)
language sql security invoker set search_path = '' as $$ select * from private.finalize_mentor_validation(validation_request_id); $$;
revoke all on function public.approve_mentor_validation(uuid),public.finalize_mentor_validation(uuid) from public,anon,authenticated;
grant execute on function public.approve_mentor_validation(uuid),public.finalize_mentor_validation(uuid) to authenticated;
