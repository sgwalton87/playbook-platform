-- The original invoker could not lock/update rows under the closed RLS boundary.
-- Keep explicit participant authority in a private command; deny direct mutation.
revoke update,delete on public.support_relationships from public,anon,authenticated;
create or replace function private.revoke_support_relationship(
  relationship_id uuid,
  reason text default null
)
returns table (
  id uuid,
  scholar_id uuid,
  supporter_id uuid,
  relationship text,
  status text,
  ended_at timestamptz,
  ended_by uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  relationship_row public.support_relationships%rowtype;
  actor_id uuid := auth.uid();
  ended_timestamp timestamptz := now();
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select r.*
    into relationship_row
    from public.support_relationships r
   where r.id = relationship_id
     and (r.scholar_id = actor_id or r.supporter_id = actor_id)
   for update;

  if not found then
    raise exception 'Support relationship not found.' using errcode = 'P0002';
  end if;

  if actor_id <> relationship_row.scholar_id
     and actor_id is distinct from relationship_row.supporter_id then
    raise exception 'Only the Scholar or connected supporter may revoke this relationship.' using errcode = '42501';
  end if;

  if relationship_row.status <> 'active' then
    raise exception 'Support relationship is already %.', relationship_row.status using errcode = '23505';
  end if;

  update public.support_relationships r
     set status = 'removed',
         permissions = '[]'::jsonb,
         ended_at = ended_timestamp,
         ended_by = actor_id,
         end_reason = nullif(trim(reason), '')
   where r.id = relationship_row.id;

  return query
  select r.id, r.scholar_id, r.supporter_id, r.relationship, r.status, r.ended_at, r.ended_by
    from public.support_relationships r
   where r.id = relationship_row.id;
end;
$$;


revoke all on function private.revoke_support_relationship(uuid,text) from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.revoke_support_relationship(uuid,text) to authenticated;
create or replace function public.revoke_support_relationship(relationship_id uuid,reason text default null)
returns table(id uuid,scholar_id uuid,supporter_id uuid,relationship text,status text,ended_at timestamptz,ended_by uuid)
language sql security invoker set search_path = '' as $$ select * from private.revoke_support_relationship(relationship_id,reason); $$;
revoke all on function public.revoke_support_relationship(uuid,text) from public,anon,authenticated;
grant execute on function public.revoke_support_relationship(uuid,text) to authenticated;
