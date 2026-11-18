begin;

do $$
begin
  if to_regprocedure('private.current_user_has_brand_campaign_authority()') is null then
    raise exception 'Missing private Brand campaign authority helper.';
  end if;

  -- This parameter-free, caller-scoped boolean helper runs inside owner-bound
  -- RLS as the authenticated caller. Direct authenticated EXECUTE is necessary
  -- for policy evaluation, while anon and PUBLIC remain denied.
  if not has_function_privilege('authenticated','private.current_user_has_brand_campaign_authority()','EXECUTE')
     or has_function_privilege('anon','private.current_user_has_brand_campaign_authority()','EXECUTE')
     or exists (select 1 from pg_proc p cross join lateral aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) acl where p.oid='private.current_user_has_brand_campaign_authority()'::regprocedure and acl.grantee=0 and acl.privilege_type='EXECUTE')
  then
    raise exception 'Brand authority RLS helper must be callable by authenticated only.';
  end if;
  if (select p.prosecdef from pg_proc p where p.oid='private.current_user_has_brand_campaign_authority()'::regprocedure) is distinct from true
     or pg_get_functiondef('private.current_user_has_brand_campaign_authority()'::regprocedure) not ilike '%auth.uid()%'
     or pg_get_functiondef('private.current_user_has_brand_campaign_authority()'::regprocedure) not ilike '%campaign_scope_approved is true%'
     or pg_get_functiondef('private.current_user_has_brand_campaign_authority()'::regprocedure) not ilike '%compliance_scope_approved is true%'
  then
    raise exception 'Brand authority is not restricted to verified caller scopes.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='brand_campaign_drafts'
       and policyname='Verified brands can create own campaign drafts'
       and coalesce(with_check,'') like '%current_user_has_brand_campaign_authority%'
       and coalesce(with_check,'') like '%brand_user_id%auth.uid%'
  ) then
    raise exception 'Brand campaign draft INSERT policy is not authority and owner bound.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='brand_campaign_drafts'
       and policyname='Verified brands can view own campaign drafts'
       and coalesce(qual,'') like '%brand_user_id%auth.uid%'
  ) then
    raise exception 'Brand campaign draft SELECT policy is not owner bound.';
  end if;

  if has_table_privilege('authenticated', 'public.nil_store_campaigns', 'INSERT')
     or has_table_privilege('authenticated', 'public.nil_store_campaigns', 'UPDATE')
     or has_table_privilege('authenticated', 'public.nil_store_campaigns', 'DELETE') then
    raise exception 'Scholar-linked NIL campaigns must remain unavailable to authenticated Brand users.';
  end if;

  if not exists (
    select 1 from information_schema.columns
     where table_schema='public' and table_name='brand_partners' and column_name='brand_user_id'
  ) then
    raise exception 'Brand organization identity is not bound to a durable Brand user.';
  end if;
end $$;

rollback;
