\set ON_ERROR_STOP on
begin;

do $$
declare
  insert_policy_count integer;
  select_policy_count integer;
  policy_roles name[];
  policy_check text;
  constraint_count integer;
  profile_fk_target text;
  album_fk_target text;
  rls_enabled boolean;
begin
  if to_regclass('public.feed_posts') is null then
    raise exception 'Canonical feed_posts table is missing from repository-owned migration history.';
  end if;

  select c.relrowsecurity into rls_enabled
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname='feed_posts';
  if not coalesce(rls_enabled,false) then
    raise exception 'feed_posts must have RLS enabled.';
  end if;

  select count(*) into insert_policy_count
  from pg_policies
  where schemaname='public' and tablename='feed_posts' and cmd='INSERT';
  if insert_policy_count<>1 then
    raise exception 'feed_posts must expose exactly one INSERT policy; got %.', insert_policy_count;
  end if;

  select roles,with_check into policy_roles,policy_check
  from pg_policies
  where schemaname='public' and tablename='feed_posts' and cmd='INSERT'
  limit 1;
  if policy_roles <> array['authenticated'::name] then
    raise exception 'feed_posts INSERT policy must be authenticated-only.';
  end if;
  if policy_check !~ 'auth.uid' or policy_check !~ 'user_id' then
    raise exception 'feed_posts INSERT policy must bind ownership to auth.uid().';
  end if;

  select count(*) into select_policy_count
  from pg_policies
  where schemaname='public' and tablename='feed_posts' and cmd='SELECT'
    and policyname in ('feed_posts_select_public','feed_posts_select_owner');
  if select_policy_count<>2 then
    raise exception 'feed_posts canonical public/owner SELECT policies are incomplete.';
  end if;

  if not has_table_privilege('anon','public.feed_posts','SELECT')
     or has_table_privilege('anon','public.feed_posts','INSERT')
     or has_table_privilege('anon','public.feed_posts','UPDATE')
     or has_table_privilege('anon','public.feed_posts','DELETE') then
    raise exception 'Anonymous Feed grants must be SELECT-only.';
  end if;
  if not has_table_privilege('authenticated','public.feed_posts','SELECT')
     or not has_table_privilege('authenticated','public.feed_posts','INSERT') then
    raise exception 'Authenticated Feed SELECT/Create Post grants are missing.';
  end if;
  if has_table_privilege('authenticated','public.feed_posts','UPDATE')
     or has_table_privilege('authenticated','public.feed_posts','DELETE') then
    raise exception 'Edit/Delete privileges must remain absent until their dedicated Phase 6 authority.';
  end if;

  select count(*) into constraint_count
  from pg_constraint
  where conrelid='public.feed_posts'::regclass
    and conname in (
      'feed_posts_post_type_nonempty_check',
      'feed_posts_visibility_check',
      'feed_posts_content_present_check'
    );
  if constraint_count<>3 then
    raise exception 'Feed post integrity constraints are incomplete.';
  end if;

  select ref.relname into profile_fk_target
  from pg_constraint c join pg_class ref on ref.oid=c.confrelid
  where c.conrelid='public.feed_posts'::regclass
    and c.conname='feed_posts_user_id_fkey' and c.contype='f';
  select ref.relname into album_fk_target
  from pg_constraint c join pg_class ref on ref.oid=c.confrelid
  where c.conrelid='public.feed_posts'::regclass
    and c.conname='feed_posts_album_id_fkey' and c.contype='f';

  if profile_fk_target is distinct from 'profiles' then
    raise exception 'Feed owner lineage must reference canonical profiles; got %.', profile_fk_target;
  end if;
  if album_fk_target is distinct from 'profile_albums' then
    raise exception 'Feed album lineage must reference canonical profile_albums; got %.', album_fk_target;
  end if;
end;
$$;

insert into auth.users(id,email)
values
  ('00000000-0000-0000-0000-00000000f301','feed-create-owner@example.invalid'),
  ('00000000-0000-0000-0000-00000000f302','feed-create-other@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility)
values
  ('00000000-0000-0000-0000-00000000f301','feed-create-owner','Feed Create Owner','private'),
  ('00000000-0000-0000-0000-00000000f302','feed-create-other','Feed Create Other','private')
on conflict(id) do update set username=excluded.username,full_name=excluded.full_name;

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000f301',true);

insert into public.feed_posts(user_id,post_type,body,visibility)
values ('00000000-0000-0000-0000-00000000f301','community','Create Post authority preflight','public');

do $$
begin
  begin
    insert into public.feed_posts(user_id,post_type,body,visibility)
    values ('00000000-0000-0000-0000-00000000f302','community','Unauthorized ownership assignment','public');
    raise exception 'Create Post allowed an authenticated user to assign another owner.';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;
rollback;
