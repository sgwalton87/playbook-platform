-- Reviewer-provided evidence snapshots are private and supplementary, never an approval.
-- No scraping or automatic attestation of external page contents.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('brand-registry-review-evidence','brand-registry-review-evidence',false,5242880,ARRAY['image/png','image/jpeg'])
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.brand_registry_review_snapshots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 request_id uuid NOT NULL REFERENCES public.brand_partner_verification_requests(id) ON DELETE RESTRICT,
 reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 storage_path text NOT NULL UNIQUE,
 source_url text NOT NULL,
 file_sha256 text NOT NULL CHECK (file_sha256 ~ '^[a-f0-9]{64}$'),
 captured_at timestamptz NOT NULL DEFAULT now(),
 source_label text NOT NULL DEFAULT 'Reviewer-selected screen capture (not independently authenticated)'
);

ALTER TABLE public.brand_registry_review_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.brand_registry_review_snapshots FROM PUBLIC, anon;
GRANT SELECT, INSERT ON public.brand_registry_review_snapshots TO authenticated;

CREATE POLICY brand_registry_snapshot_reviewer_read ON public.brand_registry_review_snapshots
FOR SELECT TO authenticated USING (
 EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid())
 AND (p.role IN ('founder','admin') OR (p.is_admin IS TRUE AND p.is_active IS TRUE)))
);
CREATE POLICY brand_registry_snapshot_reviewer_insert ON public.brand_registry_review_snapshots
FOR INSERT TO authenticated WITH CHECK (
 reviewer_id = (SELECT auth.uid())
 AND source_url LIKE 'https://bizfileonline.sos.ca.gov/%'
 AND storage_path LIKE (request_id::text || '/' || reviewer_id::text || '/%')
 AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid())
 AND (p.role IN ('founder','admin') OR (p.is_admin IS TRUE AND p.is_active IS TRUE)))
);

CREATE POLICY brand_registry_snapshot_storage_read ON storage.objects
FOR SELECT TO authenticated USING (
 bucket_id = 'brand-registry-review-evidence'
 AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid())
 AND (p.role IN ('founder','admin') OR (p.is_admin IS TRUE AND p.is_active IS TRUE)))
);
CREATE POLICY brand_registry_snapshot_storage_insert ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
 bucket_id = 'brand-registry-review-evidence'
 AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
 AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid())
 AND (p.role IN ('founder','admin') OR (p.is_admin IS TRUE AND p.is_active IS TRUE)))
);
-- No UPDATE or DELETE granted for evidence objects or snapshot records.
