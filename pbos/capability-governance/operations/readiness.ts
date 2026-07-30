import {
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../../kernel/contracts";
import { artifactDigest } from "../../kernel/identity";
import type {
  CapabilityProductionReadinessContract,
  CapabilityProductionReadinessDecision,
  OperationalControlEvidence,
} from "./types";

export function capabilityProductionReadinessDigest(
  value: CapabilityProductionReadinessContract
): string {
  const { digest: _digest, ...content } = value;
  void _digest;
  return artifactDigest(content);
}

function validateControl(
  control: OperationalControlEvidence,
  errors: string[]
): void {
  requireIdentifier(errors, "control.control_id", control.control_id);
  requireIdentifier(
    errors,
    "control.owner_identity",
    control.owner_identity
  );
  requireIdentifiers(
    errors,
    "control.evidence_references",
    control.evidence_references
  );
  requireTimestamp(errors, "control.verified_at", control.verified_at);
  if (!control.verified) {
    errors.push(`operational control is not verified: ${control.control_id}.`);
  }
  if (control.evidence_references.length === 0) {
    errors.push(`operational control lacks evidence: ${control.control_id}.`);
  }
}

export class CapabilityProductionReadinessAuthority {
  evaluate(
    contract: CapabilityProductionReadinessContract
  ): CapabilityProductionReadinessDecision {
    const errors: string[] = [];
    requireIdentifier(errors, "readiness.contract_id", contract.contract_id);
    requireIdentifier(errors, "readiness.environment", contract.environment);
    requireTimestamp(errors, "readiness.observed_at", contract.observed_at);
    requireDigest(errors, "readiness.digest", contract.digest);
    if (contract.digest !== capabilityProductionReadinessDigest(contract)) {
      errors.push("production readiness digest does not match content.");
    }
    const controls = [
      ...Object.values(contract.storage),
      contract.recovery.backup,
      contract.recovery.restore_test,
      contract.recovery.disaster_recovery,
      ...Object.values(contract.operations),
      ...Object.values(contract.security),
    ];
    controls.forEach((control) => validateControl(control, errors));
    if (
      !Number.isFinite(contract.recovery.rpo_minutes) ||
      contract.recovery.rpo_minutes < 0 ||
      !Number.isFinite(contract.recovery.rto_minutes) ||
      contract.recovery.rto_minutes < 0
    ) {
      errors.push("recovery objectives are invalid.");
    }
    if (
      contract.service_objectives.availability_percent <= 0 ||
      contract.service_objectives.availability_percent > 100 ||
      contract.service_objectives.admission_latency_ms <= 0 ||
      contract.service_objectives.recovery_event_budget < 0
    ) {
      errors.push("service objectives are invalid.");
    }
    requireIdentifier(
      errors,
      "readiness.service_objectives.evidence_reference",
      contract.service_objectives.evidence_reference
    );
    const body: CapabilityProductionReadinessDecision = {
      decision_id: `CAPABILITY-PRODUCTION-READINESS-${contract.contract_id}`,
      contract_id: contract.contract_id,
      status: errors.length === 0 ? "READY" : "BLOCKED",
      findings: errors,
      evaluated_at: contract.observed_at,
      authority: "PBOS-CAPABILITY-PRODUCTION-READINESS",
      digest: "",
    };
    const { digest: _digest, ...content } = body;
    void _digest;
    return { ...body, digest: artifactDigest(content) };
  }
}
