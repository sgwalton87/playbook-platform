import { artifactDigest } from "../identity";
import {
  contractResult,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../contracts";
import type { EngineLifecycleState } from "../admission";
import type {
  EngineLifecycleDecision,
  EngineLifecycleTransition,
} from "./types";

const TRANSITIONS: Readonly<
  Record<EngineLifecycleState, readonly EngineLifecycleState[]>
> = {
  PROPOSED: ["DESIGNED"],
  DESIGNED: ["REVIEWED"],
  REVIEWED: ["APPROVED"],
  APPROVED: ["REGISTERED"],
  REGISTERED: ["ACTIVE"],
  ACTIVE: ["MONITORED", "SUSPENDED", "DEPRECATED"],
  MONITORED: ["UPDATED", "SUSPENDED", "DEPRECATED"],
  UPDATED: ["REVIEWED"],
  SUSPENDED: ["REVIEWED", "RETIRED"],
  DEPRECATED: ["RETIRED"],
  RETIRED: [],
};

export function allowedEngineTransitions(
  state: EngineLifecycleState
): readonly EngineLifecycleState[] {
  return TRANSITIONS[state];
}

export function validateEngineLifecycleTransition(
  transition: EngineLifecycleTransition
): EngineLifecycleDecision {
  const errors: string[] = [];
  requireIdentifier(errors, "transition.transition_id", transition.transition_id);
  requireIdentifier(errors, "transition.engine_id", transition.engine_id);
  requireIdentifier(errors, "transition.authority_id", transition.authority_id);
  requireIdentifier(
    errors,
    "transition.audit_record_id",
    transition.audit_record_id
  );
  requireIdentifiers(errors, "transition.evidence_ids", transition.evidence_ids);
  requireIdentifiers(
    errors,
    "transition.validation_ids",
    transition.validation_ids
  );
  requireTimestamp(errors, "transition.requested_at", transition.requested_at);
  if (transition.authority_id === transition.engine_id) {
    errors.push("engine cannot own lifecycle transition authority.");
  }
  if (transition.evidence_ids.length === 0) {
    errors.push("engine lifecycle transition requires evidence.");
  }
  if (transition.validation_ids.length === 0) {
    errors.push("engine lifecycle transition requires validation.");
  }
  if (transition.expected_revision < 0) {
    errors.push("engine lifecycle expected revision must be non-negative.");
  }
  if (!TRANSITIONS[transition.from].includes(transition.to)) {
    errors.push(
      `engine lifecycle transition ${transition.from} -> ${transition.to} is prohibited.`
    );
  }
  const findings = contractResult(errors).errors;
  const body = {
    transition_id: transition.transition_id,
    engine_id: transition.engine_id,
    status: findings.length === 0 ? "APPROVED" as const : "REJECTED" as const,
    findings,
  };
  return { ...body, decision_digest: artifactDigest(body) };
}
