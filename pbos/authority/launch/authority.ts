import type { ChangeBoundaryDeclaration } from "../../context/change-boundary";
import { artifactDigest } from "../../kernel/identity";
import { AuthorityLedger } from "../ledger";
import type { LaunchApprovalRecord, LaunchApprovalValidation } from "./types";

export function validateLaunchApproval(input: {
  readonly approval: LaunchApprovalRecord;
  readonly boundary: ChangeBoundaryDeclaration | null;
  readonly timestamp: string;
}): LaunchApprovalValidation {
  const { approval, boundary } = input;
  const findings = [
    ...(artifactDigest({ ...approval, digest: undefined }) !== approval.digest
      ? ["Launch approval digest is invalid."]
      : []),
    ...(!boundary ? ["Change boundary is required."] : []),
    ...(!approval.requester_identity || !approval.reviewer_identity
      ? ["Requester and reviewer identities are required."]
      : []),
    ...(approval.requester_identity === approval.reviewer_identity
      ? ["Launch approval requires separation of duties."]
      : []),
    ...(boundary &&
    approval.requester_identity !== boundary.requester_identity
      ? ["Launch approval requester does not match change boundary."]
      : []),
    ...(!["APPROVED", "REJECTED", "EXPIRED", "REVOKED"].includes(approval.decision)
      ? ["Launch approval decision is invalid."]
      : []),
    ...(!approval.decision_reason || !approval.risk_acknowledgment
      ? ["Approval reason and risk acknowledgment are required."]
      : []),
    ...(boundary && approval.scope_identity !== boundary.digest
      ? ["Approval scope identity does not match change boundary."]
      : []),
    ...(boundary &&
    (approval.boundary_id !== boundary.boundary_id ||
      approval.boundary_digest !== boundary.digest)
      ? ["Approval boundary identity does not match."]
      : []),
    ...(!Number.isFinite(Date.parse(approval.expiration)) ||
    Date.parse(approval.expiration) <= Date.parse(input.timestamp)
      ? ["Launch approval is expired."]
      : []),
    ...(approval.ledger_decision.subject_id !== approval.scope_identity ||
    approval.ledger_decision.actor_id !== approval.reviewer_identity ||
    approval.ledger_decision.decision !== approval.decision
      ? ["Authority ledger decision does not match launch approval."]
      : []),
  ];
  return { valid: findings.length === 0, findings };
}

export function createLaunchApproval(input: {
  readonly boundary: ChangeBoundaryDeclaration;
  readonly requesterIdentity: string;
  readonly reviewerIdentity: string;
  readonly decision: "APPROVED" | "REJECTED" | "EXPIRED" | "REVOKED";
  readonly reason: string;
  readonly riskAcknowledgment: string;
  readonly timestamp: string;
  readonly expiration: string;
}): LaunchApprovalRecord {
  const approvalId = `LAUNCH-APPROVAL-${artifactDigest({
    boundary: input.boundary.digest,
    reviewer: input.reviewerIdentity,
    timestamp: input.timestamp,
  }).slice(0, 16)}`;
  const ledger = new AuthorityLedger().appendDecision({
    decision_id: `${approvalId}-DECISION`,
    subject_id: input.boundary.digest,
    actor_id: input.reviewerIdentity,
    decision: input.decision,
    evidence_ids: [input.boundary.digest],
    timestamp: input.timestamp,
  });
  const ledgerDecision = ledger.snapshot().decisions[0];
  if (!ledgerDecision) throw new Error("Authority ledger decision was not created.");
  const body = {
    approval_id: approvalId,
    requester_identity: input.requesterIdentity,
    reviewer_identity: input.reviewerIdentity,
    boundary_id: input.boundary.boundary_id,
    boundary_digest: input.boundary.digest,
    decision: input.decision,
    decision_reason: input.reason,
    risk_acknowledgment: input.riskAcknowledgment,
    scope_identity: input.boundary.digest,
    timestamp: input.timestamp,
    approval_timestamp: input.timestamp,
    expiration: input.expiration,
    ledger_decision: ledgerDecision,
  };
  const approval = { ...body, digest: artifactDigest(body) };
  const validation = validateLaunchApproval({
    approval,
    boundary: input.boundary,
    timestamp: input.timestamp,
  });
  if (!validation.valid) {
    throw new Error(`Launch approval rejected: ${validation.findings.join(" ")}`);
  }
  return approval;
}
