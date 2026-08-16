import { PlaybookIdentityMapper } from "../../pbos/connector/identity-mapper";
import type { PlaybookRole } from "../../pbos/connector/contracts";
import { designTokens } from "../../pbos/generated/design/tokens";
import { requireApproval, requireOwner } from "../../pbos/generated/security/authority";

export interface PlaybookFoundationRequest {
  userId: string;
  ownerId: string;
  role: PlaybookRole;
  approvalId?: string;
}

export function authorizePlaybookFoundation(request: PlaybookFoundationRequest) {
  requireOwner(request.userId, request.ownerId);
  const approvalId = requireApproval(request.approvalId);
  const identity = new PlaybookIdentityMapper().mapSupabaseIdentity(request.userId, request.role);
  const tables = request.role === "SCHOLAR_ATHLETE"
    ? ["scholar_profiles", "scholar_goals", "scholar_milestones", "athlete_profiles"] as const
    : ["scholar_profiles", "scholar_goals", "scholar_milestones"] as const;
  return {
    identity,
    approvalId,
    designTokens,
    dataBoundary: {
      ownerId: request.ownerId,
      tables,
      policy: "OWNER_SCOPED_RLS" as const
    },
    provenance: [identity.pbosIdentity.provenance, approvalId]
  };
}
