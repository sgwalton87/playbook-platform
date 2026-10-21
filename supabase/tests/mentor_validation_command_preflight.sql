\set ON_ERROR_STOP on
begin;
do $$
begin
 if has_function_privilege('anon','public.approve_mentor_validation(uuid)','EXECUTE')
    or has_function_privilege('anon','public.finalize_mentor_validation(uuid)','EXECUTE')
    or has_function_privilege('anon','private.approve_mentor_validation(uuid)','EXECUTE')
    or has_function_privilege('anon','private.finalize_mentor_validation(uuid)','EXECUTE') then
   raise exception 'Anonymous Mentor validation command execution is exposed';
 end if;
 if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where p.proname in ('approve_mentor_validation','finalize_mentor_validation')
      and ((n.nspname='public' and p.prosecdef) or (n.nspname='private' and not p.prosecdef))) then
   raise exception 'Mentor commands require invoker public wrappers and private privileged implementations';
 end if;
end;
$$;
insert into auth.users(id,email) values
 ('00000000-0000-0000-0000-00000000ad01','mentor-owner@example.invalid'),
 ('00000000-0000-0000-0000-00000000ad02','mentor-candidate@example.invalid'),
 ('00000000-0000-0000-0000-00000000ad03','mentor-parent@example.invalid');
insert into public.profiles(id,username,role) values
 ('00000000-0000-0000-0000-00000000ad01','mentor-command-owner','scholar'),
 ('00000000-0000-0000-0000-00000000ad02','mentor-command-candidate','mentor'),
 ('00000000-0000-0000-0000-00000000ad03','mentor-command-parent','parent') on conflict(id) do nothing;
insert into public.support_invitations(scholar_id,invitee_name,invitee_email,relationship,token,permissions,destination)
 values('00000000-0000-0000-0000-00000000ad01','Mentor Candidate','mentor-candidate@example.invalid','mentor',
 'mentor-command-preflight-token-00001','["view_progress","recommend_actions","support_tasks"]','/mentor-os');
insert into public.support_relationships(scholar_id,supporter_id,supporter_email,relationship,permissions,status)
 values('00000000-0000-0000-0000-00000000ad01','00000000-0000-0000-0000-00000000ad03','mentor-parent@example.invalid','parent_guardian','[]','active');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000ad02',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000ad02","email":"mentor-candidate@example.invalid"}',true);
do $$
declare claim record;
begin
 select * into claim from public.claim_support_invitation('mentor-command-preflight-token-00001','accepted');
 if claim.activation_state<>'pending_validation' or claim.validation_request_id is null then
   raise exception 'Mentor claim must create pending validation without immediate access';
 end if;
 perform set_config('test.mentor_request_id',claim.validation_request_id::text,true);
 if exists(select 1 from public.support_relationships where supporter_id='00000000-0000-0000-0000-00000000ad02' and relationship='mentor') then
   raise exception 'Mentor claim granted access before validation';
 end if;
 begin
   perform public.approve_mentor_validation(claim.validation_request_id);
   raise exception 'Mentor candidate validated their own request';
 exception when insufficient_privilege then null; end;
end;
$$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000ad03',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000ad03","email":"mentor-parent@example.invalid"}',true);
do $$
declare approved record;
begin
 select * into approved from public.approve_mentor_validation(current_setting('test.mentor_request_id')::uuid);
 if not approved.privileged_validator or not approved.threshold_met or approved.approval_count<>1 then
   raise exception 'One active Parent/Guardian must meet Mentor validation threshold';
 end if;
end;
$$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000ad02',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000ad02","email":"mentor-candidate@example.invalid"}',true);
select * from public.finalize_mentor_validation(current_setting('test.mentor_request_id')::uuid);
select * from public.finalize_mentor_validation(current_setting('test.mentor_request_id')::uuid);
do $$
begin
 if (select count(*) from public.support_relationships where supporter_id='00000000-0000-0000-0000-00000000ad02' and relationship='mentor' and status='active')<>1 then
   raise exception 'Mentor activation retries must preserve exactly one active relationship';
 end if;
end;
$$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000ad01',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000ad01","email":"mentor-owner@example.invalid"}',true);
select * from public.revoke_support_relationship((select id from public.support_relationships
 where supporter_id='00000000-0000-0000-0000-00000000ad02' and relationship='mentor'),'Mentor command preflight');
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000ad02',true);
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000ad02","email":"mentor-candidate@example.invalid"}',true);
do $$
begin
 begin
   perform public.finalize_mentor_validation(current_setting('test.mentor_request_id')::uuid);
   raise exception 'Mentor activation retry resurrected revoked access';
 exception when insufficient_privilege then null; end;
end;
$$;
rollback;
