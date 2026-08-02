import { artifactDigest } from "../kernel";
import type { ChangeInventory } from "../context/change-boundary";
import type { TransitionProposal, TransitionState } from "./types";

const NEXT_STATE: Readonly<Partial<Record<TransitionState, TransitionState>>> = {
  DRAFT: "PROPOSED",
  PROPOSED: "REQUESTER_APPROVED",
  REQUESTER_APPROVED: "REVIEWER_APPROVED",
  REVIEWER_APPROVED: "CONTEXT_REFRESH_PENDING",
  CONTEXT_REFRESH_PENDING: "CONTEXT_REFRESHED",
  CONTEXT_REFRESHED: "TRUSTED_CONTEXT_ACTIVE",
  TRUSTED_CONTEXT_ACTIVE: "VALIDATED",
  VALIDATED: "COMPLETE",
};

function withDigest(
  proposal: Omit<TransitionProposal, "digest"> | TransitionProposal
): TransitionProposal {
  const body = { ...proposal, digest: undefined };
  return { ...proposal, digest: artifactDigest(body) };
}

export function transitionScopeIdentity(inventory: ChangeInventory): string {
  return artifactDigest({
    repository_identity: inventory.repository_identity,
    branch_identity: inventory.branch_identity,
    commit_identity: inventory.commit_identity,
    inventory_identity: inventory.content_identity,
    change_type: "BASELINE_ACTIVATION",
  });
}

export function createTransitionProposal(input: {
  readonly inventory: ChangeInventory;
  readonly riskLevel: TransitionProposal["risk_level"];
  readonly purpose: string;
  readonly timestamp: string;
}): TransitionProposal {
  const scopeIdentity = transitionScopeIdentity(input.inventory);
  const draft = {
    proposal_id: `PBOS-TRANSITION-${scopeIdentity.slice(0, 16)}`,
    proposal_scope_identity: scopeIdentity,
    repository_identity: input.inventory.repository_identity,
    branch_identity: input.inventory.branch_identity,
    commit_identity: input.inventory.commit_identity,
    inventory_identity: input.inventory.content_identity,
    change_type: "BASELINE_ACTIVATION" as const,
    risk_level: input.riskLevel,
    purpose: input.purpose,
    requester_identity: null,
    requester_decision: null,
    requester_reason: null,
    requester_risk_acknowledgment: null,
    reviewer_identity: null,
    reviewer_decision: null,
    reviewer_reason: null,
    expiration: null,
    boundary_identity: null,
    launch_approval_identity: null,
    context_refresh: "NOT_STARTED" as const,
    trusted_context_identity: null,
    validation: "NOT_STARTED" as const,
    state: "PROPOSED" as const,
    state_history: [
      { state: "DRAFT" as const, timestamp: input.timestamp, evidence_identity: scopeIdentity },
      { state: "PROPOSED" as const, timestamp: input.timestamp, evidence_identity: scopeIdentity },
    ],
    created_at: input.timestamp,
    updated_at: input.timestamp,
  };
  return withDigest(draft);
}

export function advanceTransition(
  proposal: TransitionProposal,
  state: TransitionState,
  timestamp: string,
  evidenceIdentity: string,
  updates: Partial<Omit<TransitionProposal, "state" | "state_history" | "digest">> = {}
): TransitionProposal {
  if (NEXT_STATE[proposal.state] !== state) {
    throw new Error(`Invalid PBOS transition state change: ${proposal.state} -> ${state}.`);
  }
  return withDigest({
    ...proposal,
    ...updates,
    state,
    state_history: [
      ...proposal.state_history,
      { state, timestamp, evidence_identity: evidenceIdentity },
    ],
    updated_at: timestamp,
  });
}

export function validateTransitionScope(
  proposal: TransitionProposal,
  inventory: ChangeInventory,
  timestamp: string
): readonly string[] {
  const findings: string[] = [];
  if (proposal.digest !== artifactDigest({ ...proposal, digest: undefined })) {
    findings.push("Transition proposal digest is invalid.");
  }
  if (proposal.proposal_scope_identity !== transitionScopeIdentity(inventory)) {
    findings.push("Repository scope changed after transition proposal creation.");
  }
  if (inventory.changes.length > 0) {
    findings.push("Baseline activation requires committed source and a clean repository.");
  }
  if (proposal.expiration && Date.parse(proposal.expiration) <= Date.parse(timestamp)) {
    findings.push("Transition authorization is expired.");
  }
  return findings;
}

export function transitionAuthorizationStatus(state: TransitionState): string {
  if (state === "PROPOSED") return "AWAITING_REQUESTER_APPROVAL";
  if (state === "REQUESTER_APPROVED") return "AWAITING_REVIEWER_APPROVAL";
  if (state === "REVIEWER_APPROVED") return "APPROVED";
  if (["CONTEXT_REFRESH_PENDING", "CONTEXT_REFRESHED", "TRUSTED_CONTEXT_ACTIVE", "VALIDATED", "COMPLETE"].includes(state)) return "APPROVED";
  return "NOT_STARTED";
}
