-- Governed active Scholar context for support roles.
-- A supporter may focus only an active canonical support relationship.
-- The selected relationship remains the authority lineage; if it is later
-- removed or blocked, the context projection returns no active Scholar.

create table if not exists public.active_support_scholar_contexts (
  supporter_id uuid primary key references public.profiles(id) on delete cascade,
  relationship_id uuid not null references public.support_relationships(id) on delete cascade,
  scholar_id uuid not null references public.profiles(id) on delete cascade,
  selected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.active_support_scholar_contexts enable row level security;
revoke insert, update, delete on public.active_support_scholar_contexts from anon, authenticated;
grant select on public.active_support_scholar_contexts to authenticated;

drop policy if exists "Supporters view own active Scholar context" on public.active_support_scholar_contexts;
create policy "Supporters view own active Scholar context"
on public.active_support_scholar_contexts for select to authenticated
using (supporter_id = auth.uid());

create or replace function public.set_active_support_scholar_context(requested_relationship_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  relationship_row public.support_relationships%rowtype;
begin
  if actor_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;

  if requested_relationship_id is null then
    delete from public.active_support_scholar_contexts where supporter_id=actor_id;
    return jsonb_build_object('ok',true,'cleared',true);
  end if;

  select * into relationship_row
    from public.support_relationships
   where id=requested_relationship_id
     and supporter_id=actor_id
     and status='active'
   for share;

  if not found then
    raise exception 'Active support relationship required.' using errcode='42501';
  end if;

  insert into public.active_support_scholar_contexts(supporter_id,relationship_id,scholar_id,selected_at,updated_at)
  values(actor_id,relationship_row.id,relationship_row.scholar_id,now(),now())
  on conflict(supporter_id) do update
    set relationship_id=excluded.relationship_id,
        scholar_id=excluded.scholar_id,
        selected_at=now(),
        updated_at=now();

  return jsonb_build_object(
    'ok',true,
    'relationshipId',relationship_row.id,
    'scholarId',relationship_row.scholar_id
  );
end;
$$;

create or replace function public.get_active_support_scholar_context()
returns table (
  relationship_id uuid,
  scholar_id uuid,
  display_name text,
  username text,
  avatar_url text,
  relationship text,
  permissions jsonb,
  selected_at timestamptz
)
language sql
stable
security definer
set search_path=''
as $$
  select
    c.relationship_id,
    c.scholar_id,
    coalesce(nullif(trim(p.full_name),''), nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''), p.username, 'Scholar') as display_name,
    p.username,
    p.avatar_url,
    r.relationship,
    r.permissions,
    c.selected_at
  from public.active_support_scholar_contexts c
  join public.support_relationships r
    on r.id=c.relationship_id
   and r.scholar_id=c.scholar_id
   and r.supporter_id=c.supporter_id
   and r.status='active'
  join public.profiles p on p.id=c.scholar_id
  where c.supporter_id=auth.uid();
$$;

revoke all on function public.set_active_support_scholar_context(uuid) from public,anon,authenticated;
revoke all on function public.get_active_support_scholar_context() from public,anon,authenticated;
grant execute on function public.set_active_support_scholar_context(uuid) to authenticated;
grant execute on function public.get_active_support_scholar_context() to authenticated;

comment on function public.set_active_support_scholar_context(uuid) is
  'Selects or clears the current Scholar focus only when auth.uid() is the supporter on an active support relationship.';
comment on function public.get_active_support_scholar_context() is
  'Returns bounded presentation identity, relationship type, and granted permission keys for the currently selected active support relationship.';
