\set ON_ERROR_STOP on
begin;

do $$
declare
  insert_policy_count integer;
  policy_roles name[];
  policy_check text;
  constraint_count integer;
begin
  select count(*), max(roles), max(with_check)
    into insert_policy_count, policy_roles, policy_check
  from pg_policies
  where schemaname='public' and tablename='feed_posts' and cmd='INSERT';

  if insert_policy_count<>1 then
    raise exception 'feed_posts must expose exactly one INSERT policy; got %.', insert_policy_count;
  end if;
  if policy_roles <> array['authenticated'::name] then
    raise exception 'feed_posts INSERT policy must be authenticated-only.';
  end if;
  if policy_check !~ 'auth.uid' or policy_check !~ 'user_id' then
    raise exception 'feed_posts INSERT policy must bind ownership to auth.uid().';
  end if;

  if has_table_privilege('anon','public.feed_posts','INSERT')
     or has_table_privilege('anon','public.feed_posts','UPDATE')
     or has_table_privilege('anon','public.feed_posts','DELETE') then
    raise exception 'Anonymous Feed mutation privilege must be absent.';
  end if;
  if not has_table_privilege('authenticated','public.feed_posts','INSERT') then
    raise exception 'Authenticated Create Post INSERT privilege is missing.';
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
