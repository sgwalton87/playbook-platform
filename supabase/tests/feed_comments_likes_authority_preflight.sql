\set ON_ERROR_STOP on
begin;

do $$
declare
  comment_fk_count integer;
  reaction_fk_count integer;
  comment_policy_count integer;
  reaction_policy_count integer;
begin
  if to_regclass('public.feed_post_comments') is null or to_regclass('public.feed_post_reactions') is null then
    raise exception 'Feed social interaction tables are missing.';
  end if;

  select count(*) into comment_fk_count
  from pg_constraint c
  join pg_class ref on ref.oid=c.confrelid
  where c.conrelid='public.feed_post_comments'::regclass
    and c.contype='f'
    and ref.relname in ('feed_posts','profiles');
  if comment_fk_count<>2 then
    raise exception 'Feed comments canonical FK lineage is incomplete.';
  end if;

  select count(*) into reaction_fk_count
  from pg_constraint c
  join pg_class ref on ref.oid=c.confrelid
  where c.conrelid='public.feed_post_reactions'::regclass
    and c.contype='f'
    and ref.relname in ('feed_posts','profiles');
  if reaction_fk_count<>2 then
    raise exception 'Feed reactions canonical FK lineage is incomplete.';
  end if;

  select count(*) into comment_policy_count from pg_policies
  where schemaname='public' and tablename='feed_post_comments';
  if comment_policy_count<>4 then
    raise exception 'Feed comments must expose exactly four canonical policies; got %.',comment_policy_count;
  end if;

  select count(*) into reaction_policy_count from pg_policies
  where schemaname='public' and tablename='feed_post_reactions';
  if reaction_policy_count<>3 then
    raise exception 'Feed reactions must expose exactly three canonical policies; got %.',reaction_policy_count;
  end if;

  if has_table_privilege('anon','public.feed_post_comments','SELECT')
     or has_table_privilege('anon','public.feed_post_reactions','SELECT') then
    raise exception 'Anonymous users must not read Feed social interactions.';
  end if;

  if not has_table_privilege('authenticated','public.feed_post_comments','SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'Authenticated comment grants are incomplete.';
  end if;

  if not has_table_privilege('authenticated','public.feed_post_reactions','SELECT,INSERT,DELETE')
     or has_table_privilege('authenticated','public.feed_post_reactions','UPDATE') then
    raise exception 'Authenticated reaction grants violate least privilege.';
  end if;
end;
$$;

insert into auth.users(id,email)
values
 ('00000000-0000-0000-0000-00000000f401','feed-social-owner@example.invalid'),
 ('00000000-0000-0000-0000-00000000f402','feed-social-other@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility)
values
 ('00000000-0000-0000-0000-00000000f401','feed-social-owner','Feed Social Owner','private'),
 ('00000000-0000-0000-0000-00000000f402','feed-social-other','Feed Social Other','private')
on conflict(id) do update set username=excluded.username,full_name=excluded.full_name;

insert into public.feed_posts(id,user_id,post_type,body,visibility)
values
 ('00000000-0000-0000-0000-00000000f411','00000000-0000-0000-0000-00000000f401','community','Public social preflight','public'),
 ('00000000-0000-0000-0000-00000000f412','00000000-0000-0000-0000-00000000f402','community','Private social preflight','private')
on conflict(id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000f401',true);

insert into public.feed_post_comments(post_id,user_id,body)
values ('00000000-0000-0000-0000-00000000f411','00000000-0000-0000-0000-00000000f401','Owner comment');

insert into public.feed_post_reactions(post_id,user_id,reaction)
values ('00000000-0000-0000-0000-00000000f411','00000000-0000-0000-0000-00000000f401','like');

do $$
begin
  begin
    insert into public.feed_post_comments(post_id,user_id,body)
    values ('00000000-0000-0000-0000-00000000f411','00000000-0000-0000-0000-00000000f402','Cross-user comment');
    raise exception 'Cross-user comment ownership assignment was allowed.';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.feed_post_reactions(post_id,user_id,reaction)
    values ('00000000-0000-0000-0000-00000000f411','00000000-0000-0000-0000-00000000f402','like');
    raise exception 'Cross-user reaction ownership assignment was allowed.';
  exception when insufficient_privilege then null;
  end;

  if exists (
    select 1 from public.feed_post_comments where post_id='00000000-0000-0000-0000-00000000f412'
  ) then
    raise exception 'Caller could read comments for another user private post.';
  end if;
end;
$$;

reset role;
rollback;
