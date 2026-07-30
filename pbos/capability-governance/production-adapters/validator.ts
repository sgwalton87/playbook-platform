import {
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
} from "../../kernel/contracts";
import {
  productionBridgeDecisionDigest,
  productionBridgeEvidenceDigest,
  productionEvidenceRecordDigest,
  productionProofDigest,
} from "./identity";
import type {
  CapabilityProductionBridgeDecision,
  CapabilityProductionBridgeEvidence,
  ProductionEvidenceRecord,
  ProductionProof,
  ProductionStorageAdapter,
} from "./types";

export function validateProductionProof(
  proof: ProductionProof,
  observedAt: string
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "proof.proof_id", proof.proof_id);
  requireIdentifier(errors, "proof.adapter_id", proof.adapter_id);
  requireIdentifier(errors, "proof.subject_id", proof.subject_id);
  requireIdentifiers(
    errors,
    "proof.evidence_references",
    proof.evidence_references
  );
  requireTimestamp(errors, "proof.observed_at", proof.observed_at);
  requireTimestamp(errors, "proof.valid_until", proof.valid_until);
  requireDigest(errors, "proof.digest", proof.digest);
  if (proof.digest !== productionProofDigest(proof)) {
    errors.push("production proof digest does not match content.");
  }
  if (
    proof.status !== "VERIFIED" ||
    proof.evidence_references.length === 0 ||
    Date.parse(proof.observed_at) > Date.parse(observedAt) ||
    Date.parse(proof.valid_until) <= Date.parse(observedAt)
  ) {
    errors.push(`production proof is not current and verified: ${proof.proof_id}.`);
  }
  return errors;
}

export function validateProductionEvidenceRecord(
  record: ProductionEvidenceRecord
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "evidence.evidence_id", record.evidence_id);
  requireIdentifier(errors, "evidence.subject_id", record.subject_id);
  requireIdentifier(
    errors,
    "evidence.retention_class",
    record.retention_class
  );
  requireTimestamp(errors, "evidence.created_at", record.created_at);
  requireDigest(errors, "evidence.payload_digest", record.payload_digest);
  requireDigest(errors, "evidence.digest", record.digest);
  if (!Number.isInteger(record.sequence) || record.sequence < 1) {
    errors.push("production evidence sequence is invalid.");
  }
  if (record.digest !== productionEvidenceRecordDigest(record)) {
    errors.push("production evidence digest does not match content.");
  }
  return errors;
}

export function validateProductionStorageAdapter(
  adapter: ProductionStorageAdapter
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "storage.adapter_id", adapter.adapter_id);
  if (
    adapter.consistency !== "LINEARIZABLE" &&
    adapter.consistency !== "SERIALIZABLE"
  ) {
    errors.push("production storage consistency is unsupported.");
  }
  const revision = adapter.currentRevision();
  if (!Number.isInteger(revision) || revision < 0) {
    errors.push("production storage revision is invalid.");
  }
  return errors;
}

export function validateProductionBridgeEvidence(
  evidence: CapabilityProductionBridgeEvidence
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "bridge.bridge_id", evidence.bridge_id);
  requireIdentifier(errors, "bridge.environment", evidence.environment);
  requireTimestamp(errors, "bridge.observed_at", evidence.observed_at);
  requireDigest(errors, "bridge.digest", evidence.digest);
  if (evidence.digest !== productionBridgeEvidenceDigest(evidence)) {
    errors.push("production bridge evidence digest does not match content.");
  }
  const proofs = [
    ...evidence.identity,
    evidence.storage,
    evidence.evidence,
    evidence.observability,
    evidence.recovery,
  ];
  if (evidence.identity.length < 4) {
    errors.push("production identity evidence is incomplete.");
  }
  proofs.forEach((proof) =>
    errors.push(...validateProductionProof(proof, evidence.observed_at))
  );
  return errors;
}

export function validateProductionBridgeDecision(
  decision: CapabilityProductionBridgeDecision
): readonly string[] {
  const errors: string[] = [];
  requireIdentifier(errors, "bridge.decision_id", decision.decision_id);
  requireIdentifier(errors, "bridge.bridge_id", decision.bridge_id);
  requireDigest(errors, "bridge.evidence_digest", decision.evidence_digest);
  requireTimestamp(errors, "bridge.timestamp", decision.timestamp);
  requireDigest(errors, "bridge.decision_digest", decision.digest);
  if (decision.digest !== productionBridgeDecisionDigest(decision)) {
    errors.push("production bridge decision digest does not match content.");
  }
  return errors;
}
