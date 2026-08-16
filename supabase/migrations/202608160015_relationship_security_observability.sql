-- Append-only observability for governed support-relationship security events.
-- support_relationships remains canonical; this table records state transitions
-- and permission changes for auditability and operational measurement.

create table if not exists public.relationship_security_events (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.support_relationships(id) on delete restrict,
  scholar_id uuid not null,
  supporter_id uuid,
  relationship text not null,
  event_type text not null check (event_type in (
    'relationship.activated',
    'relationship.revoked',
    'relationship.blocked',
    'relationship.status_changed',
    'relationship.permissions_changed'
  )),
  actor_id uuid,
  previous_status text,
  new_status text,
  previous_permissions jsonb,
  new_permissions jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists relationship_security_events_relationship_idx
  on public.relationship_security_events(relationship_id, occurred_at desc);
create index if not exists relationship_security_events_scholar_idx
  on public.relationship_security_events(scholar_id, occurred_at desc);
create index if not exists relationship_security_events_supporter_idx
  on public.relationship_security_events(supporter_id, occurred_at desc);
create index if not exists relationship_security_events_type_idx
  on public.relationship_security_events(event_type, occurred_at desc);

alter table public.relationship_security_events enable row level security;
grant select on public.relationship_security_events to authenticated;
revoke insert, update, delete on public.relationship_security_events from authenticated;
revoke all on public.relationship_security_events from anon;

-- Relationship participants may inspect their own security history. No unrelated
-- authenticated user can browse another Scholar's support-system events.
drop policy if exists "Relationship participants can view security events"
  on public.relationship_security_events;
create policy "Relationship participants can view security events"
on public.relationship_security_events
for select
to authenticated
using (
  scholar_id = (select auth.uid())
  or supporter_id = (select auth.uid())
);

create or replace function public.capture_relationship_security_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  effective_actor uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    if new.status = 'active' then
      insert into public.relationship_security_events (
        relationship_id, scholar_id, supporter_id, relationship, event_type,
        actor_id, previous_status, new_status, previous_permissions, new_permissions
      ) values (
        new.id, new.scholar_id, new.supporter_id, new.relationship,
        'relationship.activated', effective_actor, null, new.status, null, new.permissions
      );
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status is distinct from new.status then
      insert into public.relationship_security_events (
        relationship_id, scholar_id, supporter_id, relationship, event_type,
        actor_id, previous_status, new_status, previous_permissions, new_permissions
      ) values (
        new.id, new.scholar_id, new.supporter_id, new.relationship,
        case
          when old.status = 'active' and new.status = 'removed' then 'relationship.revoked'
          when new.status = 'blocked' then 'relationship.blocked'
          else 'relationship.status_changed'
        end,
        coalesce(new.ended_by, effective_actor), old.status, new.status,
        old.permissions, new.permissions
      );
    elsif old.permissions is distinct from new.permissions then
      insert into public.relationship_security_events (
        relationship_id, scholar_id, supporter_id, relationship, event_type,
        actor_id, previous_status, new_status, previous_permissions, new_permissions
      ) values (
        new.id, new.scholar_id, new.supporter_id, new.relationship,
        'relationship.permissions_changed', effective_actor, old.status, new.status,
        old.permissions, new.permissions
      );
    end if;
    return new;
  end if;

  return new;
end;
$$;

revoke all on function public.capture_relationship_security_event() from public;
revoke all on function public.capture_relationship_security_event() from anon;
revoke all on function public.capture_relationship_security_event() from authenticated;

drop trigger if exists support_relationship_security_observability
  on public.support_relationships;
create trigger support_relationship_security_observability
after insert or update of status, permissions
on public.support_relationships
for each row
execute function public.capture_relationship_security_event();
