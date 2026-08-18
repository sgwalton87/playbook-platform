-- Phase 6 Feed Infinite Scroll.
-- One shared SECURITY INVOKER cursor service preserves feed_posts RLS for
-- anonymous and authenticated callers.

create index if not exists feed_posts_created_at_id_idx
  on public.feed_posts(created_at desc, id desc);

create or replace function public.get_feed_page(
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null,
  p_page_size integer default 20
)
returns setof public.feed_posts
language plpgsql
stable
security invoker
set search_path = public, pg_temp
as $$
declare
  bounded_page_size integer := least(greatest(coalesce(p_page_size, 20), 1), 50);
begin
  if (p_cursor_created_at is null) <> (p_cursor_id is null) then
    raise exception 'Feed cursor requires both created_at and id.' using errcode='22023';
  end if;

  return query
    select fp.*
    from public.feed_posts fp
    where p_cursor_created_at is null
       or (fp.created_at, fp.id) < (p_cursor_created_at, p_cursor_id)
    order by fp.created_at desc, fp.id desc
    limit bounded_page_size;
end;
$$;

revoke all on function public.get_feed_page(timestamptz,uuid,integer) from public, anon, authenticated;
grant execute on function public.get_feed_page(timestamptz,uuid,integer) to anon, authenticated;

comment on function public.get_feed_page(timestamptz,uuid,integer) is
  'RLS-respecting deterministic Feed cursor page ordered by created_at DESC, id DESC; page size bounded to 1..50.';
