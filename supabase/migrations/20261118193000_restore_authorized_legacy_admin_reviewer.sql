-- Preserve user-facing Scholar-Athlete role while recognizing a pre-existing,
-- DB-controlled is_admin assignment for platform review responsibilities.
-- profiles.is_admin is not user-writable by authenticated accounts.
-- This migration does not assign new grants to profiles or edit any user rows.
CREATE OR REPLACE FUNCTION private.current_user_is_platform_operator()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (
        p.role IN ('founder', 'admin')
        OR (p.is_admin IS TRUE AND p.is_active IS TRUE)
      )
  );
$function$;

CREATE OR REPLACE FUNCTION private.current_user_is_verification_reviewer()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT private.current_user_is_platform_operator();
$function$;

-- Keep operator and reviewer predicates confined to trusted definer functions.
-- Existing community and reviewer security certification forbids direct API execution.
REVOKE EXECUTE ON FUNCTION private.current_user_is_platform_operator() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private.current_user_is_verification_reviewer() FROM PUBLIC, anon, authenticated;
