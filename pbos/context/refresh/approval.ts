import { artifactDigest } from "../../kernel/identity";
import type { ContextReconciliationReport } from "../reconciliation";
import type {
  ContextRefreshApprovalRecord,
  ContextRefreshApprovalValidation,
  ContextRefreshDecisionValue,
} from "./types";

function recordDigest(
  record: Omit<ContextRefreshApprovalRecord, "digest">
): string {
  return artifactDigest(record);
}

export function createContextRefreshApproval(input: {
  readonly reconciliation: ContextReconciliationReport;
  readonly requesterIdentity: string;
  readonly reviewerIdentity: string;
  readonly decision: ContextRefreshDecisionValue;
  readonly decisionReason: string;
  readonly riskAcknowledgment: string;
  readonly timestamp: string;
  readonly expiration: string;
}): ContextRefreshApprovalRecord {
  const body: Omit<ContextRefreshApprovalRecord, "digest"> = {
    approval_id: `CONTEXT-REFRESH-APPROVAL-${artifactDigest({
      reconciliation: input.reconciliation.digest,
      requester: input.requesterIdentity,
      reviewer: input.reviewerIdentity,
      timestamp: input.timestamp,
    }).slice(0, 16)}`,
    requester_identity: input.requesterIdentity.trim(),
    reviewer_identity: input.reviewerIdentity.trim(),
    decision: input.decision,
    decision_reason: input.decisionReason.trim(),
    risk_acknowledgment: input.riskAcknowledgment.trim(),
    repository_identity:
      input.reconciliation.current_snapshot.repositoryIdentity,
    branch_identity: input.reconciliation.current_snapshot.git.branch,
    commit_identity: input.reconciliation.current_snapshot.git.commitSha,
    reconciliation_digest: input.reconciliation.digest,
    previous_context_identity: input.reconciliation.previous_identity,
    proposed_context_identity: input.reconciliation.current_identity,
    state: input.decision,
    timestamp: input.timestamp,
    expiration: input.expiration,
    applied_at: null,
    resulting_context_identity: null,
  };
  const approval = { ...body, digest: recordDigest(body) };
  const validation = validateContextRefreshApproval({
    approval,
    reconciliation: input.reconciliation,
    timestamp: input.timestamp,
    requireApproved: false,
  });
  if (!validation.valid) {
    throw new Error(
      `Context refresh approval rejected:\n${validation.findings.join("\n")}`
    );
  }
  return approval;
}

export function validateContextRefreshApproval(input: {
  readonly approval: ContextRefreshApprovalRecord;
  readonly reconciliation: ContextReconciliationReport;
  readonly timestamp: string;
  readonly requireApproved?: boolean;
}): ContextRefreshApprovalValidation {
  const { approval, reconciliation } = input;
  const findings: string[] = [];
  const expectedDigest = artifactDigest({ ...approval, digest: undefined });
  if (approval.digest !== expectedDigest) {
    findings.push("Refresh approval digest is invalid.");
  }
  if (!approval.requester_identity || !approval.reviewer_identity) {
    findings.push("Requester and reviewer identities are required.");
  } else if (approval.requester_identity === approval.reviewer_identity) {
    findings.push("Refresh approval requires an independent reviewer.");
  }
  if (!approval.decision_reason || !approval.risk_acknowledgment) {
    findings.push("Decision reason and risk acknowledgment are required.");
  }
  if (approval.state !== approval.decision) {
    findings.push("Refresh approval state does not match its decision.");
  }
  if (input.requireApproved !== false && approval.decision !== "APPROVED") {
    findings.push("Refresh approval decision is not APPROVED.");
  }
  if (
    !Number.isFinite(Date.parse(approval.expiration)) ||
    Date.parse(approval.expiration) <= Date.parse(input.timestamp)
  ) {
    findings.push("Refresh approval is expired or has invalid expiration.");
  }
  if (approval.repository_identity !== reconciliation.current_snapshot.repositoryIdentity) {
    findings.push("Refresh approval repository identity does not match.");
  }
  if (approval.branch_identity !== reconciliation.current_snapshot.git.branch) {
    findings.push("Refresh approval branch identity does not match.");
  }
  if (approval.commit_identity !== reconciliation.current_snapshot.git.commitSha) {
    findings.push("Refresh approval commit identity does not match.");
  }
  if (approval.reconciliation_digest !== reconciliation.digest) {
    findings.push("Refresh approval reconciliation digest does not match.");
  }
  if (approval.previous_context_identity !== reconciliation.previous_identity) {
    findings.push("Refresh approval previous context identity does not match.");
  }
  if (approval.proposed_context_identity !== reconciliation.current_identity) {
    findings.push("Refresh approval proposed context identity does not match.");
  }
  if (reconciliation.state !== "REVIEW_REQUIRED") {
    findings.push("Repository reconciliation does not require approved refresh.");
  }
  return { valid: findings.length === 0, findings };
}

export function applyContextRefreshApproval(
  approval: ContextRefreshApprovalRecord,
  resultingContextIdentity: string,
  timestamp: string
): ContextRefreshApprovalRecord {
  if (
    approval.state !== "APPROVED" ||
    approval.decision !== "APPROVED" ||
    resultingContextIdentity !== approval.proposed_context_identity
  ) {
    throw new Error("Context refresh approval cannot transition to APPLIED.");
  }
  const body: ContextRefreshApprovalRecord = {
    ...approval,
    state: "APPLIED",
    applied_at: timestamp,
    resulting_context_identity: resultingContextIdentity,
    digest: "",
  };
  return {
    ...body,
    digest: artifactDigest({ ...body, digest: undefined }),
  };
}

export function validateAppliedContextRefreshApproval(
  approval: ContextRefreshApprovalRecord,
  currentContextIdentity: string | null
): ContextRefreshApprovalValidation {
  const findings: string[] = [];
  if (
    approval.digest !== artifactDigest({ ...approval, digest: undefined })
  ) {
    findings.push("Refresh approval digest is invalid.");
  }
  if (
    approval.state !== "APPLIED" ||
    approval.decision !== "APPROVED" ||
    !approval.applied_at ||
    approval.resulting_context_identity !== approval.proposed_context_identity
  ) {
    findings.push("Refresh approval has not completed its governed application.");
  }
  if (currentContextIdentity !== approval.proposed_context_identity) {
    findings.push("Applied refresh approval does not match current context.");
  }
  return { valid: findings.length === 0, findings };
}
