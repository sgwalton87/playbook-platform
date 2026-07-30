import { artifactDigest } from "../../kernel/identity";
import type {
  ContextActivationDecision,
  ContextActivationEvidence,
  ContextActivationRequest,
  ContextActivationSnapshot,
  TrustedBuildContext,
} from "./types";

export function activateBuildContext(
  snapshot: ContextActivationSnapshot,
  request: ContextActivationRequest,
  decision: ContextActivationDecision,
  timestamp: string,
  expirationTimestamp: string
): ContextActivationEvidence {
  const findings = [
    ...(artifactDigest({ ...snapshot, digest: undefined }) !== snapshot.digest
      ? ["Context snapshot digest is invalid."]
      : []),
    ...(artifactDigest({ ...request, digest: undefined }) !== request.digest
      ? ["Activation request digest is invalid."]
      : []),
    ...(artifactDigest({ ...decision, digest: undefined }) !== decision.digest
      ? ["Human decision digest is invalid."]
      : []),
    ...(!snapshot.context_id || !snapshot.repository_identity || !snapshot.commit_identity
      ? ["Repository and context identity are required."]
      : []),
    ...(!snapshot.branch_identity ? ["Branch identity is required."] : []),
    ...(snapshot.reconciliation_state !== "VERIFIED"
      ? ["Context reconciliation is not verified."]
      : []),
    ...(!snapshot.working_tree_clean ? ["Working tree is dirty."] : []),
    ...(!snapshot.artifact_inventory_valid ? ["Artifact inventory is invalid."] : []),
    ...(!snapshot.architecture_inventory_valid ? ["Architecture inventory is invalid."] : []),
    ...(!snapshot.manifest_digest ? ["Manifest digest is invalid."] : []),
    ...(!snapshot.artifact_digest ? ["Artifact digest is invalid."] : []),
    ...(!snapshot.architecture_digest ? ["Architecture digest is invalid."] : []),
    ...(!snapshot.governance_digest ? ["Governance digest is invalid."] : []),
    ...(!snapshot.change_boundary_identity || !snapshot.change_boundary_valid
      ? ["Approved change boundary is required."]
      : []),
    ...(!snapshot.launch_approval_identity || !snapshot.launch_approval_valid
      ? ["Valid human launch approval is required."]
      : []),
    ...(!snapshot.governance_state_valid ? ["Governance state is invalid."] : []),
    ...(request.snapshot_digest !== snapshot.digest ? ["Context snapshot identity changed."] : []),
    ...(!request.requested_by || !request.reconciliation_digest || !request.risk_acknowledgement
      ? ["Activation requester, reconciliation evidence, and risk acknowledgement are required."]
      : []),
    ...(decision.context_id !== snapshot.context_id
      ? ["Human decision context identity mismatches."]
      : []),
    ...(decision.reviewer_identity !== snapshot.launch_approval_reviewer_identity
      ? ["Context reviewer does not match launch approval reviewer."]
      : []),
    ...(decision.decision !== "APPROVED" ? ["Human context approval is absent."] : []),
    ...(!decision.reviewer_identity || !decision.reason || decision.evidence_references.length === 0
      ? ["Reviewer identity, reason, and context evidence are required."]
      : []),
    ...(decision.risk_acknowledgement !== request.risk_acknowledgement
      ? ["Risk acknowledgement identity mismatches."]
      : []),
    ...(Date.parse(expirationTimestamp) <= Date.parse(timestamp)
      ? ["Context expiration must follow activation."]
      : []),
  ];
  const outcomeBody = {
    request_id: request.request_id,
    decision: findings.length === 0 ? "TRUSTED" as const : "BLOCKED" as const,
    decided_by: "PBOS-CONTEXT-ACTIVATION" as const,
    findings,
    timestamp,
  };
  const outcome = { ...outcomeBody, digest: artifactDigest(outcomeBody) };
  const trustedBody: Omit<TrustedBuildContext, "digest"> | null =
    findings.length === 0
      ? {
          context_id: snapshot.context_id,
          repository_identity: snapshot.repository_identity,
          commit_identity: snapshot.commit_identity,
          branch_identity: snapshot.branch_identity,
          manifest_digest: snapshot.manifest_digest,
          artifact_digest: snapshot.artifact_digest,
          architecture_digest: snapshot.architecture_digest,
          governance_digest: snapshot.governance_digest,
          change_boundary_identity: snapshot.change_boundary_identity,
          launch_approval_identity: snapshot.launch_approval_identity,
          activation_decision_id: decision.decision_id,
          created_timestamp: timestamp,
          expiration_timestamp: expirationTimestamp,
          created_by: decision.reviewer_identity,
        }
      : null;
  const trusted_context = trustedBody
    ? { ...trustedBody, digest: artifactDigest(trustedBody) }
    : null;
  const body = { snapshot, request, decision, outcome, trusted_context };
  return { ...body, digest: artifactDigest(body) };
}
