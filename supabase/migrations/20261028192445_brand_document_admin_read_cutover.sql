-- Final release phase: apply only after the matching app is READY on production.
-- The preceding migrations preserve legacy upload receipts while the app builds.
drop policy if exists brand_evidence_owner_read on storage.objects;
create policy brand_evidence_admin_only_read on storage.objects as restrictive
for select to authenticated using (
 bucket_id <> 'brand-verification-evidence' or exists (
  select 1 from public.profiles p where p.id=(select auth.uid()) and p.role in ('founder','admin')
 )
);

-- Matching app records explicit consent before enabling upload controls.
create policy brand_evidence_consent_before_upload on storage.objects as restrictive
for insert to authenticated with check (
 bucket_id <> 'brand-verification-evidence' or exists (
  select 1 from public.verification_community_consents c where c.user_id=(select auth.uid()) and c.policy_version='playbook-safety-v2-20261028'
 )
);
