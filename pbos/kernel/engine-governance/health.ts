import { artifactDigest } from "../identity";
import {
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../contracts";
import type { EngineManifest } from "../admission";
import type {
  EngineHealthDecision,
  EngineOperationalSnapshot,
} from "./types";

export function evaluateEngineHealth(
  manifest: EngineManifest,
  snapshot: EngineOperationalSnapshot
): EngineHealthDecision {
  const findings: string[] = [];
  requireIdentifier(findings, "health.engine_id", snapshot.engine_id);
  requireIdentifier(
    findings,
    "health.manifest_digest",
    snapshot.manifest_digest
  );
  requireIdentifier(findings, "health.version", snapshot.version);
  requireTimestamp(findings, "health.observed_at", snapshot.observed_at);
  requireIdentifiers(findings, "health.evidence_ids", snapshot.evidence_ids);
  requireIdentifiers(
    findings,
    "health.satisfied_requirement_ids",
    snapshot.satisfied_requirement_ids
  );
  if (
    snapshot.engine_id !== manifest.engine_id ||
    snapshot.manifest_digest !== manifest.manifest_digest ||
    snapshot.version !== manifest.version
  ) {
    findings.push("engine health identity does not match manifest.");
  }
  if (snapshot.health !== "HEALTHY") {
    findings.push("engine does not report healthy status.");
  }
  if (
    !Number.isFinite(snapshot.availability_percent) ||
    snapshot.availability_percent < 0 ||
    snapshot.availability_percent > 100
  ) {
    findings.push("engine availability is invalid.");
  }
  if (
    !Number.isFinite(snapshot.latency_ms) ||
    snapshot.latency_ms < 0 ||
    !Number.isInteger(snapshot.error_count) ||
    snapshot.error_count < 0
  ) {
    findings.push("engine operational measurements are invalid.");
  }
  if (snapshot.evidence_ids.length === 0) {
    findings.push("engine health requires evidence.");
  }
  if (!snapshot.governance_compliant) {
    findings.push("engine governance compliance is not proven.");
  }
  const satisfied = new Set(snapshot.satisfied_requirement_ids);
  for (const requirement of manifest.operational_requirements) {
    if (!satisfied.has(requirement)) {
      findings.push(`engine operational requirement unavailable: ${requirement}.`);
    }
  }
  const body = {
    engine_id: manifest.engine_id,
    status: findings.length === 0 ? "HEALTHY" as const : "UNHEALTHY" as const,
    findings,
  };
  return { ...body, decision_digest: artifactDigest(body) };
}
