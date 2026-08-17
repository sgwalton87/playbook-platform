\set ON_ERROR_STOP on
begin;

do $$
declare
  unexpected_policies text[];
begin
  if not (select relrowsecurity from pg_class where oid='public.connection_requests'::regclass)
     or not (select relrowsecurity from pg_class where oid='public.user_connections'::regclass) then
    raise exception 'Network relationship tables must keep RLS enabled.';
  end if;

  select array_agg(format('%s:%s:%s',tablename,policyname,cmd) order by tablename,policyname)
    into unexpected_policies
  from pg_policies
  where schemaname='public'
    and tablename in ('connection_requests','user_connections')
    and not (
      (tablename='connection_requests' and policyname='connection_requests_select_participants' and cmd='SELECT' and roles='{authenticated}'::name[])
      or (tablename='user_connections' and policyname='user_connections_select_owner' and cmd='SELECT' and roles='{authenticated}'::name[])
    );

  if unexpected_policies is not null then
    raise exception 'Unexpected Network relationship policies remain: %', unexpected_policies;
  end if;

  if (select count(*) from pg_policies where schemaname='public' and tablename='connection_requests') <> 1
     or (select count(*) from pg_policies where schemaname='public' and tablename='user_connections') <> 1 then
    raise exception 'Each Network relationship table must have exactly one canonical SELECT policy.';
  end if;

  if has_table_privilege('anon','public.connection_requests','SELECT')
     or has_table_privilege('anon','public.connection_requests','INSERT')
     or has_table_privilege('anon','public.connection_requests','UPDATE')
     or has_table_privilege('anon','public.connection_requests','DELETE')
     or has_table_privilege('anon','public.user_connections','SELECT')
     or has_table_privilege('anon','public.user_connections','INSERT')
     or has_table_privilege('anon','public.user_connections','UPDATE')
     or has_table_privilege('anon','public.user_connections','DELETE') then
    raise exception 'Anonymous users must have no direct relationship-table privileges.';
  end if;

  if not has_table_privilege('authenticated','public.connection_requests','SELECT')
     or not has_table_privilege('authenticated','public.user_connections','SELECT')
     or has_table_privilege('authenticated','public.connection_requests','INSERT')
     or has_table_privilege('authenticated','public.connection_requests','UPDATE')
     or has_table_privilege('authenticated','public.connection_requests','DELETE')
     or has_table_privilege('authenticated','public.user_connections','INSERT')
     or has_table_privilege('authenticated','public.user_connections','UPDATE')
     or has_table_privilege('authenticated','public.user_connections','DELETE') then
    raise exception 'Authenticated relationship-table privileges must be SELECT-only.';
  end if;
end;
$$;

rollback;
