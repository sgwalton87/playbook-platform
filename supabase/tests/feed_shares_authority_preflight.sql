\set ON_ERROR_STOP on
begin;

do $$
declare
  fk_count integer;
  policy_count integer;
begin
  if to_regclass('public.feed_post_shares') is null then
    raise exception 'feed_post_shares table is missing.';
  end if;

  select count(*) into fk_count
  from pg_constraint c
  join pg_class ref on ref.oid=c.confrelid
  where c.conrelid='public.feed_post_shares'::regclass
    and c.contype='f'
    and ref.relname in ('feed_posts','profiles');
  if fk_count<>2 then
    raise exception 'Feed Shares canonical FK lineage is incomplete.';
  end if;

  select count(*) into policy_count from pg_policies
  where schemaname='public' and tablename='feed_post_shares';
  if policy_count<>2 then
    raise exception 'Feed Shares must expose exactly two canonical policies; got %.',policy_count;
  end if;

  if has_table_privilege('anon','public.feed_post_shares','SELECT')
     or has_table_privilege('anon','public.feed_post_shares','INSERT') then
    raise exception 'Anonymous Feed Shares access must be denied.';
  end if;

  if not has_table_privilege('authenticated','public.feed_post_shares','SELECT,INSERT')
     or has_table_privilege('authenticated','public.feed_post_shares','UPDATE')
     or has_table_privilege('authenticated','public.feed_post_shares','DELETE') then
    raise exception 'Authenticated Feed Shares grants violate append-only least privilege.';
  end if;
end;
$$;

insert into auth.users(id,email)
values
 ('00000000-0000-0000-0000-00000000f701','feed-share-owner@example.invalid'),
 ('00000000-0000-0000-0000-00000000f702','feed-share-other@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility)
values
 ('00000000-0000-0000-0000-00000000f701','feed-share-owner','Feed Share Owner','private'),
 ('00000000-0000-0000-0000-00000000f702','feed-share-other','Feed Share Other','private')
on conflict(id) do update set username=excluded.username,full_name=excluded.full_name;

insert into public.feed_posts(id,user_id,post_type,body,visibility)
values
 ('00000000-0000-0000-0000-00000000f711','00000000-0000-0000-0000-00000000f701','community','Public share preflight','public'),
 ('00000000-0000-0000-0000-00000000f712','00000000-0000-0000-0000-00000000f701','community','Private share preflight','private')
on conflict(id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000f701',true);

insert into public.feed_post_shares(post_id,user_id,channel)
values ('00000000-0000-0000-0000-00000000f711','00000000-0000-0000-0000-00000000f701','copy_link');

do $$
begin
  if not exists (
    select 1 from public.feed_post_shares
    where post_id='00000000-0000-0000-0000-00000000f711'
      and user_id='00000000-0000-0000-0000-00000000f701'
      and channel='copy_link'
  ) then
    raise exception 'Owner public Feed share did not persist.';
  end if;

  begin
    insert into public.feed_post_shares(post_id,user_id,channel)
    values ('00000000-0000-0000-0000-00000000f712','00000000-0000-0000-0000-00000000f701','copy_link');
    raise exception 'Private Feed post share was allowed.';
  exception when insufficient_privilege then null;
  end;

  begin
    insert into public.feed_post_shares(post_id,user_id,channel)
    values ('00000000-0000-0000-0000-00000000f711','00000000-0000-0000-0000-00000000f702','native');
    raise exception 'Cross-user Feed share ownership assignment was allowed.';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
rollback;
