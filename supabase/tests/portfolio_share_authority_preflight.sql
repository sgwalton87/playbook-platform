\set ON_ERROR_STOP on
begin;

do $$
declare
  public_proc regprocedure;
  private_proc regprocedure;
  signature text;
  body text;
begin
  if to_regclass('public.portfolio_shares') is null then
    raise exception 'portfolio_shares is missing';
  end if;

  if not (select c.relrowsecurity from pg_class c where c.oid='public.portfolio_shares'::regclass) then
    raise exception 'portfolio_shares must keep RLS enabled';
  end if;

  if has_table_privilege('anon','public.portfolio_shares','SELECT')
     or has_table_privilege('anon','public.portfolio_shares','INSERT')
     or has_table_privilege('anon','public.portfolio_shares','UPDATE')
     or has_table_privilege('anon','public.portfolio_shares','DELETE') then
    raise exception 'anonymous callers must have no direct portfolio_shares table privileges';
  end if;

  if not has_table_privilege('authenticated','public.portfolio_shares','SELECT')
     or has_table_privilege('authenticated','public.portfolio_shares','INSERT')
     or has_table_privilege('authenticated','public.portfolio_shares','UPDATE')
     or has_table_privilege('authenticated','public.portfolio_shares','DELETE') then
    raise exception 'authenticated portfolio share access must be owner-read-only outside governed RPCs';
  end if;

  foreach public_proc in array array[
    'public.create_nil_media_kit_share(jsonb,timestamp with time zone)'::regprocedure,
    'public.revoke_portfolio_share(text)'::regprocedure,
    'public.resolve_portfolio_share(text)'::regprocedure
  ] loop
    if (select p.prosecdef from pg_proc p where p.oid=public_proc) then
      raise exception '% must remain SECURITY INVOKER', public_proc::text;
    end if;
    if not has_function_privilege('authenticated',public_proc,'EXECUTE') then
      raise exception 'authenticated wrapper execute missing for %', public_proc::text;
    end if;
  end loop;

  if has_function_privilege('anon','public.create_nil_media_kit_share(jsonb,timestamp with time zone)','EXECUTE')
     or has_function_privilege('anon','public.revoke_portfolio_share(text)','EXECUTE') then
    raise exception 'anonymous callers must not create or revoke portfolio shares';
  end if;
  if not has_function_privilege('anon','public.resolve_portfolio_share(text)','EXECUTE') then
    raise exception 'anonymous opaque-link resolver wrapper must remain executable';
  end if;

  foreach private_proc in array array[
    'private.create_nil_media_kit_share(jsonb,timestamp with time zone)'::regprocedure,
    'private.revoke_portfolio_share(text)'::regprocedure,
    'private.resolve_portfolio_share(text)'::regprocedure
  ] loop
    if not (select p.prosecdef from pg_proc p where p.oid=private_proc) then
      raise exception '% must retain private SECURITY DEFINER authority', private_proc::text;
    end if;
  end loop;

  if has_function_privilege('anon','private.create_nil_media_kit_share(jsonb,timestamp with time zone)','EXECUTE')
     or has_function_privilege('anon','private.revoke_portfolio_share(text)','EXECUTE')
     or not has_function_privilege('anon','private.resolve_portfolio_share(text)','EXECUTE') then
    raise exception 'anonymous private portfolio helper privileges are not narrowly limited to resolve-only';
  end if;

  select pg_get_function_result('public.resolve_portfolio_share(text)'::regprocedure) into signature;
  if signature ~* '\m(email|phone|household|academic|eligibility|verification|compensation|contract|disclosure|tax|reflection|relationship)\M' then
    raise exception 'public portfolio resolver signature exposes a prohibited sensitive domain: %', signature;
  end if;

  select pg_get_functiondef('private.create_nil_media_kit_share(jsonb,timestamp with time zone)'::regprocedure) into body;
  if body !~ 'gen_random_bytes\(32\)' then
    raise exception 'NIL media-kit shares must use 256-bit opaque identifiers';
  end if;
  if body !~ 'include_bio' or body !~ 'include_profile_media' or body !~ 'include_social_links'
     or body !~ 'include_brand_interests' or body !~ 'include_athlete_profile'
     or body !~ 'include_highlight_film' or body !~ 'include_media_summary' then
    raise exception 'NIL media-kit packet allowlist is incomplete';
  end if;
  if body !~ 'unsupported field or value' or body !~ 'Select at least one media kit section' then
    raise exception 'NIL media-kit packet validation is incomplete';
  end if;

  select pg_get_functiondef('private.resolve_portfolio_share(text)'::regprocedure) into body;
  if body !~ 'status = ''active''' or body !~ 'expires_at > now\(\)' or body !~ 'target_use = ''nil''' then
    raise exception 'portfolio share resolver must fail closed on status, expiry, and target use';
  end if;
  if body !~ 'include_bio' or body !~ 'include_profile_media' or body !~ 'include_social_links'
     or body !~ 'include_brand_interests' or body !~ 'include_athlete_profile'
     or body !~ 'include_highlight_film' or body !~ 'include_media_summary' then
    raise exception 'portfolio resolver does not honor the complete Scholar-selected projection allowlist';
  end if;

  select pg_get_functiondef('private.revoke_portfolio_share(text)'::regprocedure) into body;
  if body !~ 'scholar_id = caller_id' or body !~ 'status = ''revoked''' then
    raise exception 'portfolio revocation must remain Scholar-owner scoped and lifecycle-preserving';
  end if;
end $$;

rollback;
