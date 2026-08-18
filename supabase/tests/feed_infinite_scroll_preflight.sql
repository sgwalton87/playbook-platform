\set ON_ERROR_STOP on

begin;

-- Function must be SECURITY INVOKER, fixed-search-path, and executable only by
-- anonymous/authenticated API roles.
do $$
declare
  fn_oid oid;
  is_definer boolean;
  config text[];
begin
  select p.oid, p.prosecdef, p.proconfig
    into fn_oid, is_definer, config
  from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public'
    and p.proname='get_feed_page'
    and pg_get_function_identity_arguments(p.oid)='p_cursor_created_at timestamp with time zone, p_cursor_id uuid, p_page_size integer';

  if fn_oid is null then raise exception 'get_feed_page function is missing'; end if;
  if is_definer then raise exception 'get_feed_page must remain SECURITY INVOKER'; end if;
  if not ('search_path=public, pg_temp'=any(config)) then raise exception 'get_feed_page fixed search_path is missing'; end if;
  if has_function_privilege('public', fn_oid, 'EXECUTE') then raise exception 'PUBLIC must not execute get_feed_page'; end if;
  if not has_function_privilege('anon', fn_oid, 'EXECUTE') then raise exception 'anon must execute get_feed_page'; end if;
  if not has_function_privilege('authenticated', fn_oid, 'EXECUTE') then raise exception 'authenticated must execute get_feed_page'; end if;
end $$;

-- Cursor-supporting index must exist.
do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname='public' and tablename='feed_posts'
      and indexname='feed_posts_created_at_id_idx'
      and indexdef ilike '%created_at%desc%id%desc%'
  ) then
    raise exception 'Feed cursor index is missing or has the wrong ordering';
  end if;
end $$;

create temporary table feed_scroll_ids(owner_id uuid, other_id uuid, newest_id uuid, second_id uuid, third_id uuid, private_id uuid) on commit drop;

do $$
declare
  owner_id uuid := gen_random_uuid();
  other_id uuid := gen_random_uuid();
  newest_id uuid := 'ffffffff-ffff-ffff-ffff-fffffffffff4';
  second_id uuid := 'ffffffff-ffff-ffff-ffff-fffffffffff3';
  third_id uuid := 'ffffffff-ffff-ffff-ffff-fffffffffff2';
  private_id uuid := 'ffffffff-ffff-ffff-ffff-fffffffffff1';
begin
  insert into auth.users(id,email) values
    (owner_id,'feed-scroll-owner@example.invalid'),
    (other_id,'feed-scroll-other@example.invalid');
  insert into public.profiles(id,username) values
    (owner_id,'feed_scroll_owner'),
    (other_id,'feed_scroll_other');

  insert into public.feed_posts(id,user_id,post_type,body,visibility,created_at) values
    (newest_id,other_id,'community','Newest public','public','2099-01-04T00:00:00Z'),
    (second_id,owner_id,'community','Second public','public','2099-01-03T00:00:00Z'),
    (third_id,other_id,'community','Third public','public','2099-01-02T00:00:00Z'),
    (private_id,owner_id,'community','Owner private','private','2099-01-01T00:00:00Z');

  insert into feed_scroll_ids values(owner_id,other_id,newest_id,second_id,third_id,private_id);
end $$;

-- Anonymous paging sees only public rows, with deterministic continuation.
set local role anon;
do $$
declare
  ids feed_scroll_ids%rowtype;
  first_page uuid[];
  second_page uuid[];
begin
  select * into ids from feed_scroll_ids;
  select array_agg(id order by created_at desc,id desc)
    into first_page
  from public.get_feed_page(null,null,2)
  where created_at >= '2099-01-01T00:00:00Z';

  if first_page is distinct from array[ids.newest_id,ids.second_id] then
    raise exception 'Anonymous first page is not deterministic/public-only: %', first_page;
  end if;

  select array_agg(id order by created_at desc,id desc)
    into second_page
  from public.get_feed_page('2099-01-03T00:00:00Z',ids.second_id,2)
  where created_at >= '2099-01-01T00:00:00Z';

  if second_page is distinct from array[ids.third_id] then
    raise exception 'Anonymous continuation leaked private rows or returned wrong cursor page: %', second_page;
  end if;
end $$;
reset role;

-- Authenticated owner sees public rows plus their own private row, never another
-- user's private records (the existing feed_posts RLS remains authoritative).
set local role authenticated;
do $$
declare
  ids feed_scroll_ids%rowtype;
  visible_ids uuid[];
  partial_cursor_denied boolean := false;
begin
  select * into ids from feed_scroll_ids;
  perform set_config('request.jwt.claim.sub',ids.owner_id::text,true);

  select array_agg(id order by created_at desc,id desc)
    into visible_ids
  from public.get_feed_page(null,null,50)
  where created_at >= '2099-01-01T00:00:00Z';

  if visible_ids is distinct from array[ids.newest_id,ids.second_id,ids.third_id,ids.private_id] then
    raise exception 'Authenticated Feed page did not preserve public + owner-private RLS: %', visible_ids;
  end if;

  begin
    perform * from public.get_feed_page('2099-01-01T00:00:00Z',null,20);
  exception when sqlstate '22023' then
    partial_cursor_denied := true;
  end;
  if not partial_cursor_denied then raise exception 'Partial Feed cursor must fail closed'; end if;
end $$;
reset role;

-- Page size must be bounded to 50 even when a larger value is requested.
do $$
begin
  if (select count(*) from public.get_feed_page(null,null,500)) > 50 then
    raise exception 'Feed page size exceeded the canonical maximum of 50';
  end if;
end $$;

rollback;
