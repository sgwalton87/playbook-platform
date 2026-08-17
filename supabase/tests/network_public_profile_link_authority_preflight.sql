\set ON_ERROR_STOP on
begin;

do $$
begin
  if to_regprocedure('public.get_network_public_profile_linkable_ids(uuid[])') is null then
    raise exception 'Public Network profile-linkability RPC is missing.';
  end if;
  if to_regprocedure('private.get_network_public_profile_linkable_ids(uuid[])') is null then
    raise exception 'Private Network profile-linkability implementation is missing.';
  end if;
  if has_function_privilege('anon','public.get_network_public_profile_linkable_ids(uuid[])','EXECUTE') then
    raise exception 'Anonymous users must not execute Network profile-linkability RPC.';
  end if;
  if not has_function_privilege('authenticated','public.get_network_public_profile_linkable_ids(uuid[])','EXECUTE') then
    raise exception 'Authenticated users must be able to execute Network profile-linkability RPC.';
  end if;
  if position('public_profile_publication_consents' in pg_get_functiondef('private.get_network_public_profile_linkable_ids(uuid[])'::regprocedure)) = 0
     or position('public-profile-v1' in pg_get_functiondef('private.get_network_public_profile_linkable_ids(uuid[])'::regprocedure)) = 0
     or position('profile_visibility' in pg_get_functiondef('private.get_network_public_profile_linkable_ids(uuid[])'::regprocedure)) = 0 then
    raise exception 'Network profile linkability must inherit the canonical public-profile publication boundary.';
  end if;
end;
$$;

rollback;
