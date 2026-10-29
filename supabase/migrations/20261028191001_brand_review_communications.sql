-- Versioned, append-only acknowledgement: never inferred from an upload or role.
create table public.verification_community_consents (
 user_id uuid not null references public.profiles(id), policy_version text not null,
 accepted_at timestamptz not null default now(), primary key(user_id,policy_version)
);
alter table public.verification_community_consents enable row level security;
revoke all on public.verification_community_consents from public,anon,authenticated;
grant select on public.verification_community_consents to authenticated;
create policy community_consent_own_read on public.verification_community_consents for select to authenticated using(user_id=(select auth.uid()));
create function private.accept_verification_community_policy(requested_version text) returns timestamptz language plpgsql security definer set search_path='' as $$
declare recorded_at timestamptz;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid()) then raise exception 'Registered account required' using errcode='42501'; end if;
 if requested_version is distinct from 'playbook-safety-v2-20261028' then raise exception 'Current policy acknowledgement required' using errcode='22023'; end if;
 insert into public.verification_community_consents(user_id,policy_version) values(auth.uid(),requested_version) on conflict do nothing;
 select accepted_at into recorded_at from public.verification_community_consents where user_id=auth.uid() and policy_version=requested_version;
 return recorded_at;
end;$$;
create function public.accept_verification_community_policy(requested_version text) returns timestamptz language sql security invoker set search_path='' as $$select private.accept_verification_community_policy(requested_version);$$;
revoke all on function private.accept_verification_community_policy(text) from public,anon,authenticated;
revoke all on function public.accept_verification_community_policy(text) from public,anon,authenticated;
grant execute on function private.accept_verification_community_policy(text),public.accept_verification_community_policy(text) to authenticated;

-- Human verification decisions, private notes and durable communication outbox.
create table public.brand_partner_registration_details (
 brand_user_id uuid primary key references public.profiles(id) on delete cascade,
 formation_state text not null check(length(formation_state) between 2 and 80),
 entity_type text not null check(entity_type in ('LLC','Corporation','Nonprofit','Partnership','Sole proprietor','Government','Other')),
 entity_number text not null default '' check(length(entity_number)<=80),
 safety_answers jsonb not null,
 safeguarding_accepted boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.brand_partner_registration_details enable row level security;
revoke all on public.brand_partner_registration_details from public,anon,authenticated;
grant select,insert,update on public.brand_partner_registration_details to authenticated;
create policy brand_registration_read on public.brand_partner_registration_details for select to authenticated using (
 brand_user_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('founder','admin'))
);
create policy brand_registration_insert on public.brand_partner_registration_details for insert to authenticated with check (
 brand_user_id=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and coalesce(p.profile_mode,p.role)='brand-partner')
 and not exists(select 1 from public.brand_partner_verification_requests r where r.brand_user_id=(select auth.uid()) and r.status='approved')
);
create policy brand_registration_update on public.brand_partner_registration_details for update to authenticated using (
 brand_user_id=(select auth.uid()) and not exists(select 1 from public.brand_partner_verification_requests r where r.brand_user_id=(select auth.uid()) and r.status='approved')
) with check (brand_user_id=(select auth.uid()) and not exists(select 1 from public.brand_partner_verification_requests r where r.brand_user_id=(select auth.uid()) and r.status='approved'));

create table public.brand_partner_review_context (
 request_id uuid primary key references public.brand_partner_verification_requests(id) on delete restrict,
 outcome text not null check(outcome in ('under_review','needs_information','approved','rejected')),
 reason_code text not null default '', public_message text not null,
 updated_at timestamptz not null default now()
);
alter table public.brand_partner_review_context enable row level security;
revoke all on public.brand_partner_review_context from public,anon,authenticated;
grant select on public.brand_partner_review_context to authenticated;
create policy brand_context_read on public.brand_partner_review_context for select to authenticated using (
 exists(select 1 from public.brand_partner_verification_requests r where r.id=request_id and r.brand_user_id=(select auth.uid()))
 or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('founder','admin'))
);

create table public.brand_partner_registry_reviews (
 request_id uuid primary key references public.brand_partner_verification_requests(id) on delete restrict,
 result jsonb not null, reviewer_id uuid not null, updated_at timestamptz not null default now()
);
create table public.verification_internal_notes (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references public.brand_partner_verification_requests(id) on delete restrict,
 actor_id uuid not null, note text not null check(length(trim(note)) between 1 and 4000), created_at timestamptz not null default now()
);
create index verification_notes_request_time on public.verification_internal_notes(request_id,created_at desc);
create table public.verification_communications (
 id uuid primary key, request_id uuid not null references public.brand_partner_verification_requests(id) on delete restrict,
 subject_user_id uuid not null, reviewer_id uuid not null, recipient_email text not null,
 organization_name text not null, outcome text not null check(outcome in ('under_review','needs_information','approved','rejected')),
 reason_code text not null default '', public_message text not null,
 delivery_status text not null default 'queued' check(delivery_status in ('queued','sending','sent','failed','delivery_unknown')),
 claim_token uuid, claimed_by uuid, claimed_at timestamptz, attempt_count integer not null default 0,
 provider_message_id text, last_error text, created_at timestamptz not null default now(), accepted_at timestamptz
);
create index verification_comms_request_time on public.verification_communications(request_id,created_at desc);
create index verification_comms_queued on public.verification_communications(created_at) where delivery_status='queued';
alter table public.brand_partner_registry_reviews enable row level security;
alter table public.verification_internal_notes enable row level security;
alter table public.verification_communications enable row level security;
revoke all on public.brand_partner_registry_reviews,public.verification_internal_notes,public.verification_communications from public,anon,authenticated;
grant select on public.brand_partner_registry_reviews,public.verification_internal_notes,public.verification_communications to authenticated;
create policy brand_registry_admin_read on public.brand_partner_registry_reviews for select to authenticated using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('founder','admin')));
create policy verification_notes_admin_read on public.verification_internal_notes for select to authenticated using(exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('founder','admin')));
-- Communication rows are exposed through a projection that omits sender leases.
revoke select on public.verification_communications from authenticated;

create function private.get_brand_review_context(requested_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare subject_id uuid;
begin
 if auth.uid() is null or not private.current_user_is_verification_reviewer() then raise exception 'Verification reviewer authority required' using errcode='42501'; end if;
 select r.brand_user_id into subject_id from public.brand_partner_verification_requests r where r.id=requested_id;
 if subject_id is null then raise exception 'Request not found' using errcode='P0002'; end if;
 return jsonb_build_object(
  'organizationName',(select organization_name from public.brand_partner_verification_requests where id=requested_id),
  'registration',(select to_jsonb(d) from public.brand_partner_registration_details d where d.brand_user_id=subject_id),
  'registry',(select result from public.brand_partner_registry_reviews where request_id=requested_id),
  'workflow',(select to_jsonb(w) from public.brand_partner_review_context w where w.request_id=requested_id),
  'notes',coalesce((select jsonb_agg(to_jsonb(n) order by n.created_at desc) from public.verification_internal_notes n where n.request_id=requested_id),'[]'::jsonb),
  'communications',coalesce((select jsonb_agg(to_jsonb(c)-array['claim_token','claimed_by'] order by c.created_at desc) from public.verification_communications c where c.request_id=requested_id),'[]'::jsonb)
 );
end;$$;

create function private.record_brand_registry_review(requested_id uuid, requested_result jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.current_user_is_verification_reviewer() then raise exception 'Verification reviewer authority required' using errcode='42501'; end if;
 perform 1 from public.brand_partner_verification_requests r where r.id=requested_id for update;
 if not found then raise exception 'Request not found' using errcode='P0002'; end if;
 if coalesce(requested_result->>'human_outcome','') not in ('needs_review','matched_active','alternative_verified','confirmed_issue')
 or length(coalesce(requested_result->>'source_url','')) not between 8 and 2000
 or length(coalesce(requested_result->>'review_note','')) not between 1 and 4000 then raise exception 'Official source and human review note required' using errcode='22023'; end if;
 if (requested_result->>'human_outcome' in ('matched_active','alternative_verified') or requested_result->>'safety_reviewed'='true') and not exists(
  select 1 from public.brand_partner_registration_details d join public.brand_partner_verification_requests r on r.brand_user_id=d.brand_user_id
  where r.id=requested_id and d.updated_at=(requested_result->>'registration_updated_at')::timestamptz
 ) then raise exception 'Declarations changed; reload and review the current answers' using errcode='23514'; end if;
 insert into public.verification_internal_notes(request_id,actor_id,note) values(requested_id,auth.uid(),'Registration/safeguarding determination: '||(requested_result->>'human_outcome')||E'\n'||(requested_result->>'review_note'));
 insert into public.brand_partner_registry_reviews(request_id,result,reviewer_id) values(requested_id,requested_result,auth.uid())
 on conflict(request_id) do update set result=excluded.result,reviewer_id=auth.uid(),updated_at=now();
end;$$;

create function private.validate_brand_registration_before_approval() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='approved' and (TG_OP='INSERT' or old.status is distinct from 'approved') then
  if not exists(select 1 from public.brand_partner_registration_details d where d.brand_user_id=new.brand_user_id
   and d.safeguarding_accepted and d.safety_answers->>'minors' in ('no','yes','private_review')
   and d.safety_answers->>'financial' in ('no','yes','private_review') and d.safety_answers->>'violence' in ('no','yes','private_review')
   and d.safety_answers->>'pending' in ('no','yes','private_review') and d.safety_answers->>'restrictions' in ('no','yes','private_review')) then
   raise exception 'Business registration and safeguarding declarations are required before approval' using errcode='23514'; end if;
  if not exists(select 1 from public.verification_community_consents c where c.user_id=new.brand_user_id and c.policy_version='playbook-safety-v2-20261028') then raise exception 'Current community standards acknowledgement required before approval' using errcode='23514'; end if;
  if not exists(select 1 from public.brand_partner_registry_reviews v where v.request_id=new.id
   and v.result->>'human_outcome' in ('matched_active','alternative_verified') and v.result->>'safety_reviewed'='true') then
   raise exception 'Human registration and safeguarding review are required before approval' using errcode='23514'; end if;
 end if;
 return new;
end;$$;
create trigger brand_registration_before_approval before insert or update of status on public.brand_partner_verification_requests
for each row execute function private.validate_brand_registration_before_approval();
revoke all on function private.validate_brand_registration_before_approval() from public,anon,authenticated;

create function private.complete_brand_review(requested_id uuid, requested_outcome text, requested_reason text, requested_message text,
 requested_private_note text, requested_action_id uuid, requested_documents_reviewed boolean, requested_campaign_scope boolean, requested_compliance_scope boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
declare subject_id uuid; recipient text; organization text; existing public.verification_communications; decision text; review_result jsonb;
begin
 if auth.uid() is null or not private.current_user_is_verification_reviewer() then raise exception 'Verification reviewer authority required' using errcode='42501'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(requested_action_id::text));
 select * into existing from public.verification_communications where id=requested_action_id;
 if found then
  if existing.request_id<>requested_id or existing.outcome<>requested_outcome or existing.public_message<>requested_message then raise exception 'Action identifier already used' using errcode='22023'; end if;
  return jsonb_build_object('communicationId',existing.id,'deliveryStatus',existing.delivery_status,'replayed',true);
 end if;
 select r.brand_user_id,r.organization_name into subject_id,organization from public.brand_partner_verification_requests r where r.id=requested_id for update;
 if subject_id is null then raise exception 'Request not found' using errcode='P0002'; end if;
 if subject_id=auth.uid() then raise exception 'Self review is not permitted' using errcode='42501'; end if;
 if requested_outcome not in ('under_review','needs_information','approved','rejected') or length(trim(coalesce(requested_message,''))) not between 1 and 4000
 or length(coalesce(requested_private_note,''))>4000 then raise exception 'Invalid review message' using errcode='22023'; end if;
 if requested_outcome='needs_information' and coalesce(requested_reason,'') not in ('missing_document','unreadable_document','legal_name_mismatch','registration_details','registry_not_matched','standing_clarification','representative_authority','contact_mismatch','safeguarding_clarification','campaign_scope') then raise exception 'Additional verification reason required' using errcode='22023'; end if;
 if requested_outcome='rejected' and coalesce(requested_reason,'') not in ('registration_not_established','identity_not_established','authority_not_established','safeguarding_not_met','unsupported_activity','material_inconsistency') then raise exception 'Decline reason required' using errcode='22023'; end if;
 if requested_outcome='approved' and not(coalesce(requested_documents_reviewed,false) and coalesce(requested_campaign_scope,false) and coalesce(requested_compliance_scope,false)) then raise exception 'Explicit document, campaign and compliance review required' using errcode='23514'; end if;
 select u.email into recipient from auth.users u where u.id=subject_id;
 if recipient is null then raise exception 'Verified account email unavailable' using errcode='23514'; end if;
 decision:=case when requested_outcome='needs_information' then 'under_review' else requested_outcome end;
 review_result:=private.review_verification_request('brand-partner',requested_id,decision,requested_message);
 insert into public.brand_partner_review_context(request_id,outcome,reason_code,public_message) values(requested_id,requested_outcome,coalesce(requested_reason,''),requested_message)
 on conflict(request_id) do update set outcome=excluded.outcome,reason_code=excluded.reason_code,public_message=excluded.public_message,updated_at=now();
 if length(trim(coalesce(requested_private_note,'')))>0 then insert into public.verification_internal_notes(request_id,actor_id,note) values(requested_id,auth.uid(),trim(requested_private_note)); end if;
 insert into public.verification_communications(id,request_id,subject_user_id,reviewer_id,recipient_email,organization_name,outcome,reason_code,public_message)
 values(requested_action_id,requested_id,subject_id,auth.uid(),recipient,organization,requested_outcome,coalesce(requested_reason,''),requested_message);
 return jsonb_build_object('review',review_result,'communicationId',requested_action_id,'deliveryStatus','queued');
end;$$;

create function private.add_brand_review_note(requested_id uuid, requested_note text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.current_user_is_verification_reviewer() then raise exception 'Verification reviewer authority required' using errcode='42501'; end if;
 if length(trim(coalesce(requested_note,''))) not between 1 and 4000 then raise exception 'A note is required' using errcode='22023'; end if;
 insert into public.verification_internal_notes(request_id,actor_id,note) values(requested_id,auth.uid(),trim(requested_note));
end;$$;

create function private.claim_brand_review_email(requested_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare claimed public.verification_communications;
begin
 if auth.uid() is null or not private.current_user_is_verification_reviewer() then raise exception 'Verification reviewer authority required' using errcode='42501'; end if;
 update public.verification_communications set delivery_status='sending',claim_token=gen_random_uuid(),claimed_by=auth.uid(),claimed_at=now(),attempt_count=attempt_count+1,last_error=null
 where id=requested_id and delivery_status in ('queued','failed') returning * into claimed;
 if not found then return null; end if;
 return to_jsonb(claimed);
end;$$;
create function private.finish_brand_review_email(requested_id uuid, requested_claim uuid, requested_status text, requested_error text, requested_message_id text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.current_user_is_verification_reviewer() then raise exception 'Verification reviewer authority required' using errcode='42501'; end if;
 if requested_status not in ('sent','failed','delivery_unknown') then raise exception 'Invalid delivery status' using errcode='22023'; end if;
 update public.verification_communications set delivery_status=requested_status,last_error=left(requested_error,1000),provider_message_id=left(requested_message_id,240),accepted_at=case when requested_status='sent' then now() else null end
 where id=requested_id and claim_token=requested_claim and claimed_by=auth.uid() and delivery_status='sending';
 if not found then raise exception 'Sender lease not found' using errcode='42501'; end if;
end;$$;
create function private.list_brand_review_communications() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not private.current_user_is_verification_reviewer() then raise exception 'Verification reviewer authority required' using errcode='42501'; end if;
 return coalesce((select jsonb_agg(to_jsonb(c)-array['claim_token','claimed_by'] order by c.created_at desc) from (select * from public.verification_communications order by created_at desc limit 100) c),'[]'::jsonb);
end;$$;

create function public.get_brand_review_context(requested_id uuid) returns jsonb language sql stable security invoker set search_path='' as $$ select private.get_brand_review_context(requested_id); $$;
revoke all on function private.get_brand_review_context(uuid) from public,anon,authenticated;
grant execute on function private.get_brand_review_context(uuid) to authenticated;
revoke all on function public.get_brand_review_context(uuid) from public,anon,authenticated;
grant execute on function public.get_brand_review_context(uuid) to authenticated;

create function public.record_brand_registry_review(requested_id uuid, requested_result jsonb) returns void language sql  security invoker set search_path='' as $$ select private.record_brand_registry_review(requested_id,requested_result); $$;
revoke all on function private.record_brand_registry_review(uuid,jsonb) from public,anon,authenticated;
grant execute on function private.record_brand_registry_review(uuid,jsonb) to authenticated;
revoke all on function public.record_brand_registry_review(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.record_brand_registry_review(uuid,jsonb) to authenticated;

create function public.complete_brand_review(requested_id uuid, requested_outcome text, requested_reason text, requested_message text, requested_private_note text, requested_action_id uuid, requested_documents_reviewed boolean, requested_campaign_scope boolean, requested_compliance_scope boolean) returns jsonb language sql  security invoker set search_path='' as $$ select private.complete_brand_review(requested_id,requested_outcome,requested_reason,requested_message,requested_private_note,requested_action_id,requested_documents_reviewed,requested_campaign_scope,requested_compliance_scope); $$;
revoke all on function private.complete_brand_review(uuid,text,text,text,text,uuid,boolean,boolean,boolean) from public,anon,authenticated;
grant execute on function private.complete_brand_review(uuid,text,text,text,text,uuid,boolean,boolean,boolean) to authenticated;
revoke all on function public.complete_brand_review(uuid,text,text,text,text,uuid,boolean,boolean,boolean) from public,anon,authenticated;
grant execute on function public.complete_brand_review(uuid,text,text,text,text,uuid,boolean,boolean,boolean) to authenticated;

create function public.add_brand_review_note(requested_id uuid, requested_note text) returns void language sql  security invoker set search_path='' as $$ select private.add_brand_review_note(requested_id,requested_note); $$;
revoke all on function private.add_brand_review_note(uuid,text) from public,anon,authenticated;
grant execute on function private.add_brand_review_note(uuid,text) to authenticated;
revoke all on function public.add_brand_review_note(uuid,text) from public,anon,authenticated;
grant execute on function public.add_brand_review_note(uuid,text) to authenticated;

create function public.claim_brand_review_email(requested_id uuid) returns jsonb language sql  security invoker set search_path='' as $$ select private.claim_brand_review_email(requested_id); $$;
revoke all on function private.claim_brand_review_email(uuid) from public,anon,authenticated;
grant execute on function private.claim_brand_review_email(uuid) to authenticated;
revoke all on function public.claim_brand_review_email(uuid) from public,anon,authenticated;
grant execute on function public.claim_brand_review_email(uuid) to authenticated;

create function public.finish_brand_review_email(requested_id uuid, requested_claim uuid, requested_status text, requested_error text, requested_message_id text) returns void language sql  security invoker set search_path='' as $$ select private.finish_brand_review_email(requested_id,requested_claim,requested_status,requested_error,requested_message_id); $$;
revoke all on function private.finish_brand_review_email(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function private.finish_brand_review_email(uuid,uuid,text,text,text) to authenticated;
revoke all on function public.finish_brand_review_email(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.finish_brand_review_email(uuid,uuid,text,text,text) to authenticated;

create function public.list_brand_review_communications() returns jsonb language sql stable security invoker set search_path='' as $$ select private.list_brand_review_communications(); $$;
revoke all on function private.list_brand_review_communications() from public,anon,authenticated;
grant execute on function private.list_brand_review_communications() to authenticated;
revoke all on function public.list_brand_review_communications() from public,anon,authenticated;
grant execute on function public.list_brand_review_communications() to authenticated;

-- New submissions and changed declarations invalidate prior reviewer eligibility.
create function private.invalidate_brand_review_eligibility() returns trigger language plpgsql security definer set search_path='' as $$
declare subject_id uuid;
begin
 if TG_TABLE_NAME='brand_partner_registration_details' then
  if to_jsonb(new)-'updated_at'=to_jsonb(old)-'updated_at' then return new; end if;
  subject_id:=new.brand_user_id;
 else
  if new.submitted_at is not distinct from old.submitted_at then return new; end if;
  subject_id:=new.brand_user_id;
 end if;
 update public.brand_partner_registry_reviews v set result=jsonb_set(jsonb_set(v.result,'{human_outcome}','"needs_review"'::jsonb),'{safety_reviewed}','false'::jsonb),updated_at=now()
 from public.brand_partner_verification_requests r where v.request_id=r.id and r.brand_user_id=subject_id;
 return new;
end;$$;
revoke all on function private.invalidate_brand_review_eligibility() from public,anon,authenticated;
create trigger brand_declarations_changed after update on public.brand_partner_registration_details for each row execute function private.invalidate_brand_review_eligibility();
create trigger brand_submission_changed after update of submitted_at on public.brand_partner_verification_requests for each row execute function private.invalidate_brand_review_eligibility();

-- Serialize applicant edits with reviewer decisions. A stale owner write cannot
-- commit after approval merely because its RLS snapshot was taken earlier.
create function private.guard_brand_registration_change() returns trigger language plpgsql security definer set search_path='' as $$
declare current_status text;
begin
 select r.status into current_status from public.brand_partner_verification_requests r where r.brand_user_id=new.brand_user_id for update;
 if current_status='approved' then raise exception 'Approved registration requires a new governed review before changes' using errcode='23514'; end if;
 return new;
end;$$;
revoke all on function private.guard_brand_registration_change() from public,anon,authenticated;
create trigger brand_registration_change_guard before insert or update on public.brand_partner_registration_details for each row execute function private.guard_brand_registration_change();

-- Derived registry research is traceable and separate from the human determination.
create table public.brand_registry_research_events (
 id uuid primary key default gen_random_uuid(),request_id uuid not null references public.brand_partner_verification_requests(id),
 actor_id uuid not null references public.profiles(id),result jsonb not null,created_at timestamptz not null default now()
);
alter table public.brand_registry_research_events enable row level security;
revoke all on public.brand_registry_research_events from public,anon,authenticated;
grant select on public.brand_registry_research_events to authenticated;
create policy brand_research_reviewer_read on public.brand_registry_research_events for select to authenticated using(private.current_user_is_verification_reviewer());
create function private.record_brand_registry_research(requested_id uuid,requested_result jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.current_user_is_verification_reviewer() or exists(select 1 from public.brand_partner_verification_requests where id=requested_id and brand_user_id=auth.uid()) then raise exception 'Independent reviewer authority required' using errcode='42501'; end if;
 if pg_column_size(requested_result)>50000 or jsonb_typeof(requested_result)<>'object' then raise exception 'Bounded research object required' using errcode='22023'; end if;
 insert into public.brand_registry_research_events(request_id,actor_id,result) values(requested_id,auth.uid(),requested_result);
end;$$;
create function public.record_brand_registry_research(requested_id uuid,requested_result jsonb) returns void language sql security invoker set search_path='' as $$select private.record_brand_registry_research(requested_id,requested_result);$$;
revoke all on function private.record_brand_registry_research(uuid,jsonb),public.record_brand_registry_research(uuid,jsonb) from public,anon,authenticated;
grant execute on function private.record_brand_registry_research(uuid,jsonb),public.record_brand_registry_research(uuid,jsonb) to authenticated;

-- The older public RPC must not bypass required messaging and scope checks.
-- Preserve the athlete-evidence dispatch and every other role's existing path.
create or replace function public.review_verification_request(requested_type text,requested_id uuid,requested_decision text,requested_notes text default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
begin
 if requested_type='brand-partner' then raise exception 'Use the Brand Partner review and communication workflow' using errcode='42501'; end if;
 if requested_type='athlete-evidence' then return private.review_athlete_evidence_request(requested_id,requested_decision,requested_notes); end if;
 return private.review_verification_request(requested_type,requested_id,requested_decision,requested_notes);
end;$$;
revoke all on function public.review_verification_request(text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.review_verification_request(text,uuid,text,text) to authenticated;
