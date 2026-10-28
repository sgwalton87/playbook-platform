export const BRAND_EVIDENCE_BUCKET = "brand-verification-evidence";
export const BRAND_REVIEW_TARGET_HOURS = 72;
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type BrandDocumentRow = {
  document_id: string; storage_path: string; document_type: string; uploaded_at: string;
  request_id: string | null; organization_name: string | null; verification_status: string | null;
  submitted_at: string | null; archived_at: string | null; archive_reason: string | null;
};
export function brandReviewDueAt(submittedAt: string | null): string | null {
  const date = submittedAt ? new Date(submittedAt).getTime() : NaN;
  return Number.isFinite(date) ? new Date(date + BRAND_REVIEW_TARGET_HOURS * 60 * 60 * 1000).toISOString() : null;
}
export function presentBrandDocument(row: BrandDocumentRow) {
  return {
    id: row.document_id, name: row.storage_path.split("/").pop() ?? "Document", type: row.document_type,
    url: `/api/admin/verification/brand-evidence/file?documentId=${encodeURIComponent(row.document_id)}`,
    organizationName: row.organization_name || "Organization not yet submitted", requestId: row.request_id,
    status: row.verification_status || "Not submitted", uploadedAt: row.uploaded_at,
    reviewDueAt: brandReviewDueAt(row.submitted_at), archivedAt: row.archived_at, archiveReason: row.archive_reason,
  };
}
export type BrandDocument = ReturnType<typeof presentBrandDocument>;
