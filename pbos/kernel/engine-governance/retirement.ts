import { artifactDigest } from "../identity";
import {
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../contracts";
import type {
  EngineRetirementDecision,
  EngineRetirementRequest,
} from "./types";

export function evaluateEngineRetirement(
  request: EngineRetirementRequest
): EngineRetirementDecision {
  const findings: string[] = [];
  requireIdentifier(findings, "retirement.request_id", request.request_id);
  requireIdentifier(findings, "retirement.authority_id", request.authority_id);
  requireIdentifier(
    findings,
    "retirement.deprecation_notice_id",
    request.deprecation_notice_id
  );
  requireIdentifier(
    findings,
    "retirement.migration_plan_id",
    request.migration_plan_id
  );
  requireIdentifier(
    findings,
    "retirement.dependency_impact_review_id",
    request.dependency_impact_review_id
  );
  requireIdentifier(
    findings,
    "retirement.data_impact_review_id",
    request.data_impact_review_id
  );
  requireIdentifier(
    findings,
    "retirement.evidence_preservation_id",
    request.evidence_preservation_id
  );
  requireIdentifier(
    findings,
    "retirement.certification_closure_id",
    request.certification_closure_id
  );
  requireIdentifiers(
    findings,
    "retirement.validation_ids",
    request.validation_ids
  );
  requireTimestamp(findings, "retirement.requested_at", request.requested_at);
  if (request.authority_id === request.manifest.engine_id) {
    findings.push("engine cannot own retirement authority.");
  }
  if (
    request.manifest.lifecycle_state !== "DEPRECATED" &&
    request.manifest.lifecycle_state !== "SUSPENDED"
  ) {
    findings.push("engine must be DEPRECATED or SUSPENDED before retirement.");
  }
  if (request.validation_ids.length === 0) {
    findings.push("engine retirement requires validation.");
  }
  const body = {
    request_id: request.request_id,
    engine_id: request.manifest.engine_id,
    status: findings.length === 0 ? "ELIGIBLE" as const : "REJECTED" as const,
    findings,
  };
  return { ...body, decision_digest: artifactDigest(body) };
}
