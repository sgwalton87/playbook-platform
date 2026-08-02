export type EvidenceType =
  | "document"
  | "photo"
  | "video"
  | "link"
  | "certificate"
  | "transcript"
  | "recommendation"
  | "media"
  | "other";

export type EvidenceSourceType = "self_reported" | "institution" | "supporter" | "integration" | "import";
export type EvidenceVerificationState = "unverified" | "pending" | "verified" | "rejected";
export type EvidenceVisibility = "private" | "school" | "network" | "public";
export type EvidenceConsentScope = "owner_only" | "relationship" | "support_network" | "public";

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  description?: string;
  url?: string;
  filePath?: string;
  source?: string;
  sourceType: EvidenceSourceType;
  sourceReference?: string;
  ownerId: string;
  verificationState: EvidenceVerificationState;
  verificationActorId?: string;
  verificationActorRole?: string;
  verifiedAt?: string;
  lastObservedAt: string;
  visibility: EvidenceVisibility;
  consentScope: EvidenceConsentScope;
  stateReason?: string;
  expiresAt?: string;
  uploadedAt?: string;
  verified?: boolean;
}

export function mapEvidenceRow(row: Record<string, unknown>): Evidence {
  return {
    id: String(row.id),
    type: row.evidence_type as EvidenceType,
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    url: row.url ? String(row.url) : undefined,
    filePath: row.file_path ? String(row.file_path) : undefined,
    source: row.source ? String(row.source) : undefined,
    sourceType: row.source_type as EvidenceSourceType,
    sourceReference: row.source_reference ? String(row.source_reference) : undefined,
    ownerId: String(row.owner_id),
    verificationState: row.verification_state as EvidenceVerificationState,
    verificationActorId: row.verification_actor_id ? String(row.verification_actor_id) : undefined,
    verificationActorRole: row.verification_actor_role ? String(row.verification_actor_role) : undefined,
    verifiedAt: row.verified_at ? String(row.verified_at) : undefined,
    lastObservedAt: String(row.last_observed_at),
    visibility: row.visibility as EvidenceVisibility,
    consentScope: row.consent_scope as EvidenceConsentScope,
    stateReason: row.state_reason ? String(row.state_reason) : undefined,
    expiresAt: row.expires_at ? String(row.expires_at) : undefined,
    uploadedAt: row.uploaded_at ? String(row.uploaded_at) : undefined,
    verified: row.verification_state === "verified",
  };
}
