import { artifactDigest } from "../../kernel/identity";
import type {
  AuthorizationDecision,
  AuthorizationEvidence,
  AuthorizationRequest,
} from "./types";

export class HumanAuthorizationGateway {
  decide(
    request: AuthorizationRequest,
    decision: "APPROVED" | "DENIED",
    approver: string,
    reason: string,
    timestamp: string,
    expiresAt: string | null
  ): AuthorizationEvidence {
    if (!approver || !reason || request.evidence.length === 0) {
      throw new Error("Authorization decision evidence is incomplete.");
    }
    if (
      request.risk_level === "RED" &&
      approver === request.requester
    ) {
      throw new Error("RED authorization requires independent human approval.");
    }
    const decisionBody: AuthorizationDecision = {
      request_id: request.request_id,
      decision,
      approver,
      reason,
      timestamp,
      expires_at: expiresAt,
      request_digest: request.digest,
      digest: "",
    };
    const authorization = {
      ...decisionBody,
      digest: artifactDigest({ ...decisionBody, digest: undefined }),
    };
    const evidenceBody: AuthorizationEvidence = {
      request,
      decision: authorization,
      valid: decision === "APPROVED",
      findings: decision === "APPROVED" ? [] : [reason],
      digest: "",
    };
    return {
      ...evidenceBody,
      digest: artifactDigest({ ...evidenceBody, digest: undefined }),
    };
  }
}
