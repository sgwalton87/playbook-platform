import type { PlaybookIdentityMapping } from "../../pbos/connector/contracts";
import { authorizePlaybookFoundation } from "./foundation";

export const SUPPORT_CATEGORIES = ["RECOMMENDATION", "DOCUMENTS", "ESSAY_REVIEW", "DEADLINE", "OTHER"] as const;
export type SupportCategory = typeof SUPPORT_CATEGORIES[number];

export interface SupportRelationshipEvidence {
  relationshipId: string;
  scholarId: string;
  supporterId?: string | null;
  supporterEmail: string;
  status: string;
  permissions: readonly string[];
}

export interface ApplicationSupportRepository {
  createRequest(input: { scholarId: string; workspaceId: string; relationshipId: string; category: SupportCategory;
    summary: string; idempotencyKey: string; provenance: readonly string[] }): Promise<{ requestId: string }>;
  markDelivered(input: { scholarId: string; requestId: string; provenance: readonly string[] }): Promise<void>;
}

export interface ApplicationSupportRuntime {
  registerIdentity(userId: string): Promise<PlaybookIdentityMapping>;
  publishRequest(identity: PlaybookIdentityMapping, input: { requestId: string; workspaceId: string;
    relationshipId: string; category: SupportCategory; correlationId: string }): Promise<readonly string[]>;
}

export function authorizeSupportRelationship(input: { actorId: string; scholarId: string; approvalId: string;
  relationship: SupportRelationshipEvidence }) {
  const owner = authorizePlaybookFoundation({ userId: input.actorId, ownerId: input.scholarId,
    role: "SCHOLAR", approvalId: input.approvalId });
  const relationship = input.relationship;
  if (relationship.scholarId !== input.scholarId || relationship.status !== "active" ||
      !relationship.permissions.includes("support_tasks") || (!relationship.supporterId && !relationship.supporterEmail.trim())) {
    throw new Error("Support relationship is not active and authorized for support tasks.");
  }
  return { relationshipId: relationship.relationshipId,
    provenance: [...owner.provenance, "relationship:" + relationship.relationshipId, "permission:support_tasks"] };
}

export class ApplicationSupportRequestService {
  constructor(private readonly repository: ApplicationSupportRepository, private readonly runtime: ApplicationSupportRuntime) {}

  async request(input: { actorId: string; scholarId: string; workspaceId: string; relationship: SupportRelationshipEvidence;
    category: SupportCategory; summary: string; approvalId: string; idempotencyKey: string }) {
    if (!input.workspaceId.trim() || !input.idempotencyKey.trim()) throw new Error("Workspace and idempotency evidence are required.");
    if (!(SUPPORT_CATEGORIES as readonly string[]).includes(input.category)) throw new Error("Support category is invalid.");
    const summary = input.summary.trim();
    if (summary.length < 3 || summary.length > 500) throw new Error("Support request must be between 3 and 500 characters.");
    const authority = authorizeSupportRelationship(input);
    const identity = await this.runtime.registerIdentity(input.actorId);
    const baseProvenance = [...authority.provenance, identity.pbosIdentity.provenance];
    const saved = await this.repository.createRequest({ scholarId: input.scholarId, workspaceId: input.workspaceId,
      relationshipId: authority.relationshipId, category: input.category, summary,
      idempotencyKey: input.idempotencyKey, provenance: baseProvenance });
    const runtimeProvenance = await this.runtime.publishRequest(identity, { requestId: saved.requestId,
      workspaceId: input.workspaceId, relationshipId: authority.relationshipId, category: input.category,
      correlationId: input.idempotencyKey });
    const provenance = [...baseProvenance, ...runtimeProvenance, input.approvalId];
    await this.repository.markDelivered({ scholarId: input.scholarId, requestId: saved.requestId, provenance });
    return { requestId: saved.requestId, state: "OPEN" as const, provenance };
  }
}
