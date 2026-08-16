begin;

do $$
begin
  if to_regprocedure('private.current_user_has_brand_campaign_authority()') is null then
    raise exception 'Missing private Brand campaign authority helper.';
  end if;

  if exists (
    select 1 from information_schema.routine_privileges
     where specific_schema = 'private'
       and routine_name = 'current_user_has_brand_campaign_authority'
       and grantee in ('PUBLIC','anon','authenticated')
       and privilege_type = 'EXECUTE'
  ) then
    raise exception 'Private Brand campaign authority helper must not be directly executable by API roles.';
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
