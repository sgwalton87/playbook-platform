-- Move Active Scholar Context authority out of the exposed public SECURITY DEFINER surface.
-- Public RPC signatures remain stable as SECURITY INVOKER wrappers; private helpers retain
-- supporter ownership checks, active-relationship validation, bounded Scholar identity, and
-- revocation-safe revalidation on every read.

create or replace function private.set_active_support_scholar_context(requested_relationship_id uuid default null)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  actor_id uuid := auth.uid();
  relationship_row public.support_relationships%rowtype;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;

  if requested_relationship_id is null then
    delete from public.active_support_scholar_contexts
     where supporter_id=actor_id;
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

  insert into public.active_support_scholar_contexts(
    supporter_id,relationship_id,scholar_id,selected_at,updated_at
  ) values(
    actor_id,relationship_row.id,relationship_row.scholar_id,now(),now()
  )
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

create or replace function private.get_available_support_scholar_contexts()
returns table (
  relationship_id uuid,
  scholar_id uuid,
  display_name text,
  username text,
  avatar_url text,
  relationship text,
  permissions jsonb,
  created_at timestamptz
)
language sql
stable
security definer
set search_path=''
as $$
  select
    r.id,
    r.scholar_id,
    coalesce(
      nullif(trim(p.full_name),''),
      nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),
      p.username,
      'Scholar'
    ) as display_name,
    p.username,
    p.avatar_url,
    r.relationship,
    r.permissions,
    r.created_at
  from public.support_relationships r
  join public.profiles p on p.id=r.scholar_id
  where r.supporter_id=auth.uid()
    and r.status='active'
  order by r.created_at desc;
$$;

create or replace function private.get_active_support_scholar_context()
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
    coalesce(
      nullif(trim(p.full_name),''),
      nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),
      p.username,
      'Scholar'
    ) as display_name,
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

revoke all on function private.set_active_support_scholar_context(uuid) from public,anon,authenticated;
revoke all on function private.get_available_support_scholar_contexts() from public,anon,authenticated;
revoke all on function private.get_active_support_scholar_context() from public,anon,authenticated;
grant execute on function private.set_active_support_scholar_context(uuid) to authenticated;
grant execute on function private.get_available_support_scholar_contexts() to authenticated;
grant execute on function private.get_active_support_scholar_context() to authenticated;

create or replace function public.set_active_support_scholar_context(requested_relationship_id uuid default null)
returns jsonb
language sql
security invoker
set search_path=''
as $$
  select private.set_active_support_scholar_context(requested_relationship_id);
$$;

create or replace function public.get_available_support_scholar_contexts()
returns table (
  relationship_id uuid,
  scholar_id uuid,
  display_name text,
  username text,
  avatar_url text,
  relationship text,
  permissions jsonb,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path=''
as $$
  select * from private.get_available_support_scholar_contexts();
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
security invoker
set search_path=''
as $$
  select * from private.get_active_support_scholar_context();
$$;

revoke all on function public.set_active_support_scholar_context(uuid) from public,anon,authenticated;
revoke all on function public.get_available_support_scholar_contexts() from public,anon,authenticated;
revoke all on function public.get_active_support_scholar_context() from public,anon,authenticated;
grant execute on function public.set_active_support_scholar_context(uuid) to authenticated;
grant execute on function public.get_available_support_scholar_contexts() to authenticated;
grant execute on function public.get_active_support_scholar_context() to authenticated;

comment on function public.set_active_support_scholar_context(uuid) is
  'Authenticated invoker wrapper that selects or clears Scholar focus only through the private active-relationship authority helper.';
comment on function public.get_available_support_scholar_contexts() is
  'Authenticated invoker wrapper for bounded active Scholar relationship choices.';
comment on function public.get_active_support_scholar_context() is
  'Authenticated invoker wrapper for the currently selected Scholar context; private authority re-checks that the relationship remains active.';
