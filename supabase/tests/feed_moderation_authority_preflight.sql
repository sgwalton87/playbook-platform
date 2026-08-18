\set ON_ERROR_STOP on

begin;

do $$
declare
  moderate_oid oid;
  projection_oid oid;
  moderate_config text[];
  projection_config text[];
begin
  select p.oid,p.proconfig into moderate_oid,moderate_config
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='moderate_feed_post';
  select p.oid,p.proconfig into projection_oid,projection_config
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='get_moderation_feed_posts';

  if moderate_oid is null then raise exception 'moderate_feed_post is missing'; end if;
  if projection_oid is null then raise exception 'get_moderation_feed_posts is missing'; end if;
  if not (select prosecdef from pg_proc where oid=moderate_oid) then raise exception 'moderate_feed_post must be SECURITY DEFINER'; end if;
  if not (select prosecdef from pg_proc where oid=projection_oid) then raise exception 'get_moderation_feed_posts must be SECURITY DEFINER'; end if;
  if not ('search_path=public, private, pg_temp'=any(moderate_config)) then raise exception 'moderate_feed_post fixed search_path is missing'; end if;
  if not ('search_path=public, private, pg_temp'=any(projection_config)) then raise exception 'get_moderation_feed_posts fixed search_path is missing'; end if;
  if has_function_privilege('anon',moderate_oid,'EXECUTE') or has_function_privilege('anon',projection_oid,'EXECUTE') then
    raise exception 'anon must not execute Feed moderation functions';
  end if;
  if not has_function_privilege('authenticated',moderate_oid,'EXECUTE') or not has_function_privilege('authenticated',projection_oid,'EXECUTE') then
    raise exception 'authenticated API role requires function entrypoints with internal moderator authority checks';
  end if;
  if has_function_privilege('anon','private.current_user_is_platform_moderator()','EXECUTE')
     or not has_function_privilege('authenticated','private.current_user_is_platform_moderator()','EXECUTE') then
    raise exception 'Moderator RLS predicate must be authenticated-only and unavailable to anonymous callers';
  end if;
end $$;

do $$
begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='feed_posts' and policyname='feed_posts_select_public' and cmd='SELECT' and qual ilike '%moderation_state%visible%') then
    raise exception 'Public Feed policy must enforce visible moderation state';
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='feed_posts' and policyname='feed_posts_select_owner' and cmd='SELECT' and qual ilike '%auth.uid%user_id%') then
    raise exception 'Owner Feed policy must remain available for transparency';
  end if;
  if exists(select 1 from pg_policies where schemaname='public' and tablename='feed_posts' and policyname='feed_posts_select_moderator') then
    raise exception 'Moderator review must not widen general Feed SELECT RLS';
  end if;
end $$;

create temporary table feed_moderation_ids(owner_id uuid, reporter_id uuid, moderator_id uuid, post_id uuid, report_id uuid) on commit drop;
grant select on feed_moderation_ids to anon,authenticated;

do $$
declare
  owner_id uuid:=gen_random_uuid();
  reporter_id uuid:=gen_random_uuid();
  moderator_id uuid:=gen_random_uuid();
  post_id uuid:=gen_random_uuid();
  report_id uuid:=gen_random_uuid();
begin
  insert into auth.users(id,email) values
    (owner_id,'feed-mod-owner@example.invalid'),
    (reporter_id,'feed-mod-reporter@example.invalid'),
    (moderator_id,'feed-mod-moderator@example.invalid');
  insert into public.profiles(id,username,role) values
    (owner_id,'feed_mod_owner','scholar'),
    (reporter_id,'feed_mod_reporter','scholar'),
    (moderator_id,'feed_mod_moderator','founder');
  insert into public.feed_posts(id,user_id,post_type,body,visibility,created_at) values
    (post_id,owner_id,'community','Moderation target','public','2099-02-01T00:00:00Z');
  insert into public.moderation_reports(id,reporter_id,target_type,target_id,reason) values
    (report_id,reporter_id,'post',post_id::text,'Safety review');
  insert into feed_moderation_ids values(owner_id,reporter_id,moderator_id,post_id,report_id);
end $$;

-- A normal authenticated member cannot read the moderator projection or enforce state.
set local role authenticated;
do $$
declare ids feed_moderation_ids%rowtype; projection_denied boolean:=false; moderate_denied boolean:=false;
begin
  select * into ids from feed_moderation_ids;
  perform set_config('request.jwt.claim.sub',ids.reporter_id::text,true);
  begin
    perform * from public.get_moderation_feed_posts(array[ids.post_id]);
  exception when sqlstate '42501' then projection_denied:=true;
  end;
  begin
    perform public.moderate_feed_post(ids.post_id,'hide_content',ids.report_id,'not allowed');
  exception when sqlstate '42501' then moderate_denied:=true;
  end;
  if not projection_denied then raise exception 'Non-moderator accessed Feed moderation projection'; end if;
  if not moderate_denied then raise exception 'Non-moderator was able to hide Feed content'; end if;
end $$;
reset role;

-- Founder/Admin can read the narrow projection and execute the atomic hide.
set local role authenticated;
do $$
declare ids feed_moderation_ids%rowtype; projected_state text; state text;
begin
  select * into ids from feed_moderation_ids;
  perform set_config('request.jwt.claim.sub',ids.moderator_id::text,true);
  select moderation_state into projected_state from public.get_moderation_feed_posts(array[ids.post_id]) where id=ids.post_id;
  if projected_state <> 'visible' then raise exception 'Moderator projection did not return visible Feed state'; end if;
  select moderation_state into state from public.moderate_feed_post(ids.post_id,'hide_content',ids.report_id,'Policy review complete');
  if state <> 'hidden' then raise exception 'Moderator hide did not persist hidden state'; end if;
  select moderation_state into projected_state from public.get_moderation_feed_posts(array[ids.post_id]) where id=ids.post_id;
  if projected_state <> 'hidden' then raise exception 'Moderator projection did not return hidden Feed state'; end if;
end $$;
reset role;

-- Inspect audit/report persistence as the database test owner. This deliberately
-- does not grant authenticated direct table access merely to make the test pass.
do $$
declare ids feed_moderation_ids%rowtype; report_status text; action_count int;
begin
  select * into ids from feed_moderation_ids;
  select status into report_status from public.moderation_reports where id=ids.report_id;
  if report_status <> 'resolved' then raise exception 'Hide action did not resolve linked report'; end if;
  select count(*) into action_count from public.moderation_actions where report_id=ids.report_id and action_type='hide_content' and moderator_id=ids.moderator_id;
  if action_count <> 1 then raise exception 'Hide action did not append exactly one moderation audit row'; end if;
end $$;

-- Anonymous/public Feed reads cannot see hidden content.
set local role anon;
do $$
declare ids feed_moderation_ids%rowtype; visible_count int;
begin
  select * into ids from feed_moderation_ids;
  select count(*) into visible_count from public.get_feed_page(null,null,50) where id=ids.post_id;
  if visible_count <> 0 then raise exception 'Hidden Feed post leaked through public pager'; end if;
end $$;
reset role;

-- The author retains visibility to their own hidden story.
set local role authenticated;
do $$
declare ids feed_moderation_ids%rowtype; owner_count int;
begin
  select * into ids from feed_moderation_ids;
  perform set_config('request.jwt.claim.sub',ids.owner_id::text,true);
  select count(*) into owner_count from public.feed_posts where id=ids.post_id and moderation_state='hidden';
  if owner_count <> 1 then raise exception 'Owner lost transparency access to hidden Feed post'; end if;
end $$;
reset role;

-- Moderator can restore and the public pager sees the public story again.
set local role authenticated;
do $$
declare ids feed_moderation_ids%rowtype; state text;
begin
  select * into ids from feed_moderation_ids;
  perform set_config('request.jwt.claim.sub',ids.moderator_id::text,true);
  select moderation_state into state from public.moderate_feed_post(ids.post_id,'restore_content',null,'Restored after review');
  if state <> 'visible' then raise exception 'Moderator restore did not persist visible state'; end if;
end $$;
reset role;

set local role anon;
do $$
declare ids feed_moderation_ids%rowtype; visible_count int;
begin
  select * into ids from feed_moderation_ids;
  select count(*) into visible_count from public.get_feed_page(null,null,50) where id=ids.post_id;
  if visible_count <> 1 then raise exception 'Restored public Feed post did not return through pager'; end if;
end $$;
reset role;

rollback;