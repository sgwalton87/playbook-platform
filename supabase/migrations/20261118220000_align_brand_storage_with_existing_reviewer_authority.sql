-- Align private object SELECT with the canonical active platform reviewer designation.
-- Existing RLS never grants ownership changes, deletes, updates, or public access.
-- Preserve the restrictive policy for every non-brand bucket unchanged.
DROP POLICY IF EXISTS brand_evidence_admin_only_read ON storage.objects;
CREATE POLICY brand_evidence_admin_only_read ON storage.objects AS RESTRICTIVE
FOR SELECT TO authenticated USING (
  bucket_id <> 'brand-verification-evidence'
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND (p.role IN ('founder','admin') OR (p.is_admin IS TRUE AND p.is_active IS TRUE))
  )
);

DROP POLICY IF EXISTS brand_evidence_reviewer_read ON storage.objects;
CREATE POLICY brand_evidence_reviewer_read ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'brand-verification-evidence'
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND (p.role IN ('founder','admin') OR (p.is_admin IS TRUE AND p.is_active IS TRUE))
  )
);
