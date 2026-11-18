\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE
  restrictive_policy text;
  reviewer_policy text;
BEGIN
  SELECT qual INTO restrictive_policy FROM pg_policies
  WHERE schemaname='storage' AND tablename='objects'
    AND policyname='brand_evidence_admin_only_read'
    AND permissive='RESTRICTIVE' AND cmd='SELECT' AND roles='{authenticated}';
  SELECT qual INTO reviewer_policy FROM pg_policies
  WHERE schemaname='storage' AND tablename='objects'
    AND policyname='brand_evidence_reviewer_read'
    AND permissive='PERMISSIVE' AND cmd='SELECT' AND roles='{authenticated}';

  IF restrictive_policy IS NULL OR reviewer_policy IS NULL THEN
    RAISE EXCEPTION 'Missing protected private evidence SELECT policy pair';
  END IF;
  IF restrictive_policy NOT LIKE '%is_admin%' OR reviewer_policy NOT LIKE '%is_admin%'
    OR restrictive_policy NOT LIKE '%is_active%' OR reviewer_policy NOT LIKE '%is_active%'
    OR restrictive_policy NOT LIKE '%auth.uid%' OR reviewer_policy NOT LIKE '%auth.uid%'
    OR restrictive_policy NOT LIKE '%brand-verification-evidence%' OR reviewer_policy NOT LIKE '%brand-verification-evidence%'
  THEN
    RAISE EXCEPTION 'Evidence storage RLS not aligned to active, identity-scoped admin designation';
  END IF;
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='storage.objects'::regclass)
    OR (SELECT public FROM storage.buckets WHERE id='brand-verification-evidence') IS DISTINCT FROM FALSE
  THEN
    RAISE EXCEPTION 'Private bucket and storage RLS must remain enforced';
  END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname='storage'
      AND tablename='objects' AND cmd IN ('UPDATE','DELETE')
      AND policyname IN ('brand_evidence_no_user_delete','brand_evidence_no_user_replace')) <> 2
  THEN
    RAISE EXCEPTION 'Protected evidence write restrictions must remain present';
  END IF;
END $$;
ROLLBACK;
