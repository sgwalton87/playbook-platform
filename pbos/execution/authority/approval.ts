import type { ApprovalRecord } from "../../authority";
import type { TrustedBuildContext } from "../../context/activation";
import { artifactDigest } from "../../kernel/identity";
import type { CodexExecutionPackage } from "../../orchestration";

export function createExecutionApproval(input: {
  readonly package: CodexExecutionPackage;
  readonly context: TrustedBuildContext;
  readonly requested_by: string;
  readonly approved_by: string;
  readonly decision: "APPROVED" | "REJECTED";
  readonly reason: string;
  readonly risk_acknowledgment: string;
  readonly risk_level: "GREEN" | "YELLOW" | "RED";
  readonly scope: readonly string[];
  readonly timestamp: string;
  readonly expiration: string;
}): ApprovalRecord {
  if (
    !input.requested_by ||
    !input.approved_by ||
    input.requested_by === input.approved_by ||
    !input.reason ||
    !input.risk_acknowledgment ||
    input.scope.length === 0 ||
    Date.parse(input.expiration) <= Date.parse(input.timestamp)
  ) {
    throw new Error("Execution approval evidence is incomplete.");
  }
  const identity = artifactDigest({
    package: input.package.digest,
    context: input.context.digest,
    requester: input.requested_by,
    reviewer: input.approved_by,
  });
  const body = {
    approval_id: `EXECUTION-APPROVAL-${identity.slice(0, 16)}`,
    request_id: `EXECUTION-REQUEST-${identity.slice(0, 16)}`,
    package_id: input.package.package_id,
    package_digest: input.package.digest,
    context_digest: input.context.digest,
    requested_by: input.requested_by,
    approved_by: input.approved_by,
    authority_type: `HUMAN:${input.reason}:${input.risk_acknowledgment}`,
    risk_level: input.risk_level,
    scope: [...input.scope].sort(),
    decision: input.decision,
    timestamp: input.timestamp,
    expiration: input.expiration,
  };
  return { ...body, digest: artifactDigest(body) };
}
