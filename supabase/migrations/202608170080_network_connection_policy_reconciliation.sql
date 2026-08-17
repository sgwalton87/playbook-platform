-- Production reconciliation for legacy Network relationship policies whose
-- historical names were not represented in committed migration history.
-- Fail closed by replacing the complete policy surface with canonical reads only.

do $$
declare
  policy_record record;
begin
  for policy_record in
    select tablename, policyname
    from pg_policies
    where schemaname='public'
      and tablename in ('connection_requests','user_connections')
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      policy_record.policyname,
      policy_record.tablename
    );
  end loop;
end;
$$;

create policy connection_requests_select_participants
on public.connection_requests for select to authenticated
using ((select auth.uid()) = requester_id or (select auth.uid()) = recipient_id);

create policy user_connections_select_owner
on public.user_connections for select to authenticated
using ((select auth.uid()) = user_id);

-- Anonymous relationship-table access is not a public Platform capability.
-- Relationship identity is exposed only through the bounded public projections.
revoke all on public.connection_requests from anon;
revoke all on public.user_connections from anon;

-- Keep the table API read-only for authenticated users. All writes remain behind
-- the governed Network lifecycle RPCs installed by migration 079.
revoke insert,update,delete on public.connection_requests from authenticated;
revoke insert,update,delete on public.user_connections from authenticated;
grant select on public.connection_requests to authenticated;
grant select on public.user_connections to authenticated;

comment on table public.connection_requests is
  'Canonical Network request lifecycle. Exactly one authenticated participant SELECT policy; mutations are governed by Network RPC authority.';
comment on table public.user_connections is
  'Canonical reciprocal Network edges. Exactly one authenticated owner SELECT policy; mutations are governed by Network RPC authority.';
