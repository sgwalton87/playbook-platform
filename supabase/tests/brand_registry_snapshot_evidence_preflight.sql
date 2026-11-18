\set ON_ERROR_STOP on
BEGIN;
DO $$
DECLARE
  policy_count int;
  bucket_public boolean;
  screenshot_grant boolean;
  gate_def text;
BEGIN
 SELECT public INTO bucket_public FROM storage.buckets WHERE id='brand-registry-review-evidence';
 IF bucket_public IS DISTINCT FROM false THEN RAISE EXCEPTION 'Registry screenshot bucket must be private'; END IF;
 IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='public.brand_registry_review_snapshots'::regclass)
 THEN RAISE EXCEPTION 'Evidence audit table must enforce RLS'; END IF;
 SELECT COUNT(*) INTO policy_count FROM pg_policies
 WHERE schemaname='public' AND tablename='brand_registry_review_snapshots'
 AND policyname IN ('brand_registry_snapshot_reviewer_read','brand_registry_snapshot_reviewer_insert')
 AND qual::text IS DISTINCT FROM 'true';
 IF policy_count <> 2 THEN RAISE EXCEPTION 'Snapshot audit must have protected reviewer policies'; END IF;
 IF EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='brand_registry_review_snapshots' AND cmd IN ('UPDATE','DELETE'))
 THEN RAISE EXCEPTION 'Screenshot evidence audit cannot have user update/delete policies'; END IF;
 IF EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND
 policyname IN ('brand_registry_snapshot_storage_read','brand_registry_snapshot_storage_insert') AND
 coalesce(qual,'') NOT LIKE '%is_admin%' AND coalesce(with_check,'') NOT LIKE '%is_admin%')
 THEN RAISE EXCEPTION 'Screenshot storage access must use protected reviewer designation'; END IF;
 SELECT pg_get_functiondef('private.validate_brand_registration_before_approval()'::regprocedure) INTO gate_def;
 IF gate_def NOT LIKE '%brand_registry_review_snapshots%' THEN RAISE EXCEPTION 'California approval screenshot gate missing'; END IF;
END $$;
ROLLBACK;
