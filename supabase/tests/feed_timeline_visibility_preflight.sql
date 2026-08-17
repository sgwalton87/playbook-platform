\set ON_ERROR_STOP on
begin;

do $$
declare
  public_policy_count integer;
  owner_policy_count integer;
begin
  select count(*) into public_policy_count
  from pg_policies
  where schemaname='public' and tablename='feed_posts'
    and policyname='feed_posts_select_public'
    and cmd='SELECT'
    and roles='{anon,authenticated}'
    and qual ilike '%visibility%public%';
  if public_policy_count<>1 then
    raise exception 'Canonical public Feed read policy is missing or changed.';
  end if;

  select count(*) into owner_policy_count
  from pg_policies
  where schemaname='public' and tablename='feed_posts'
    and policyname='feed_posts_select_owner'
    and cmd='SELECT'
    and roles='{authenticated}'
    and qual ilike '%auth.uid%user_id%';
  if owner_policy_count<>1 then
    raise exception 'Canonical owner Feed read policy is missing or changed.';
  end if;

  if has_table_privilege('anon','public.feed_posts','INSERT')
     or has_table_privilege('anon','public.feed_posts','UPDATE')
     or has_table_privilege('anon','public.feed_posts','DELETE') then
    raise exception 'Anonymous Feed mutation privileges must remain denied.';
  end if;
end;
$$;

insert into auth.users(id,email)
values
 ('00000000-0000-0000-0000-00000000f601','feed-visibility-owner@example.invalid'),
 ('00000000-0000-0000-0000-00000000f602','feed-visibility-other@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility)
values
 ('00000000-0000-0000-0000-00000000f601','feed-visibility-owner','Feed Visibility Owner','private'),
 ('00000000-0000-0000-0000-00000000f602','feed-visibility-other','Feed Visibility Other','private')
on conflict(id) do update set username=excluded.username,full_name=excluded.full_name;

insert into public.feed_posts(id,user_id,post_type,body,visibility)
values
 ('00000000-0000-0000-0000-00000000f611','00000000-0000-0000-0000-00000000f601','community','Public visibility preflight','public'),
 ('00000000-0000-0000-0000-00000000f612','00000000-0000-0000-0000-00000000f601','community','Private visibility preflight','private')
on conflict(id) do nothing;

set local role anon;
do $$
begin
  if not exists (select 1 from public.feed_posts where id='00000000-0000-0000-0000-00000000f611') then
    raise exception 'Anonymous caller could not read public Feed post.';
  end if;
  if exists (select 1 from public.feed_posts where id='00000000-0000-0000-0000-00000000f612') then
    raise exception 'Anonymous caller could read private Feed post.';
  end if;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000f601',true);
do $$
begin
  if not exists (select 1 from public.feed_posts where id='00000000-0000-0000-0000-00000000f612') then
    raise exception 'Owner could not read own private Feed post.';
  end if;
end;
$$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000f602',true);
do $$
begin
  if exists (select 1 from public.feed_posts where id='00000000-0000-0000-0000-00000000f612') then
    raise exception 'Other authenticated user could read owner private Feed post.';
  end if;
  if not exists (select 1 from public.feed_posts where id='00000000-0000-0000-0000-00000000f611') then
    raise exception 'Other authenticated user could not read public Feed post.';
  end if;
end;
$$;
reset role;

rollback;
