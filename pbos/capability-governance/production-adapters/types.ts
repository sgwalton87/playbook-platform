export interface ProductionProof {
  readonly proof_id: string;
  readonly adapter_id: string;
  readonly subject_id: string;
  readonly status: "VERIFIED" | "REJECTED" | "UNAVAILABLE";
  readonly evidence_references: readonly string[];
  readonly observed_at: string;
  readonly valid_until: string;
  readonly digest: string;
}

export interface ProductionIdentityAdapter {
  readonly adapter_id: string;
  lookupIdentity(identityId: string, observedAt: string): ProductionProof;
  verifyCredential(
    identityId: string,
    credentialReference: string,
    observedAt: string
  ): ProductionProof;
  verifyIssuer(issuerId: string, observedAt: string): ProductionProof;
  resolveAuthority(
    identityId: string,
    resourceId: string,
    operation: string,
    observedAt: string
  ): ProductionProof;
}

export interface ProductionStorageTransaction {
  readonly transaction_id: string;
  readonly expected_revision: number;
  readonly operations: readonly {
    readonly operation_id: string;
    readonly subject_id: string;
    readonly payload_digest: string;
  }[];
}

export interface ProductionStorageAdapter {
  readonly adapter_id: string;
  readonly consistency:
    | "LINEARIZABLE"
    | "SERIALIZABLE"
    | "READ_AFTER_WRITE"
    | "UNSUPPORTED";
  currentRevision(): number;
  transact(transaction: ProductionStorageTransaction): ProductionProof;
  health(observedAt: string): ProductionProof;
}

export interface ProductionEvidenceRecord {
  readonly evidence_id: string;
  readonly subject_id: string;
  readonly sequence: number;
  readonly previous_digest: string | null;
  readonly payload_digest: string;
  readonly retention_class: string;
  readonly created_at: string;
  readonly digest: string;
}

export interface ProductionEvidenceAdapter {
  readonly adapter_id: string;
  append(record: ProductionEvidenceRecord): ProductionProof;
  retrieve(evidenceId: string, observedAt: string): ProductionEvidenceRecord | null;
  verifyChain(subjectId: string, observedAt: string): ProductionProof;
}

export interface ProductionObservabilityAdapter {
  readonly adapter_id: string;
  emitMetric(name: string, value: number, observedAt: string): ProductionProof;
  emitAlert(name: string, severity: string, observedAt: string): ProductionProof;
  emitSecurityEvent(eventId: string, observedAt: string): ProductionProof;
  health(observedAt: string): ProductionProof;
}

export interface ProductionRecoveryAdapter {
  readonly adapter_id: string;
  backup(observedAt: string): ProductionProof;
  restore(backupReference: string, observedAt: string): ProductionProof;
  verifyState(stateDigest: string, observedAt: string): ProductionProof;
  health(observedAt: string): ProductionProof;
}

export interface CapabilityProductionBridgeEvidence {
  readonly bridge_id: string;
  readonly environment: string;
  readonly identity: readonly ProductionProof[];
  readonly storage: ProductionProof;
  readonly evidence: ProductionProof;
  readonly observability: ProductionProof;
  readonly recovery: ProductionProof;
  readonly observed_at: string;
  readonly digest: string;
}

export interface CapabilityProductionBridgeDecision {
  readonly decision_id: string;
  readonly bridge_id: string;
  readonly status: "READY" | "BLOCKED";
  readonly findings: readonly string[];
  readonly evidence_digest: string;
  readonly authority: "PBOS-CAPABILITY-PRODUCTION-BRIDGE";
  readonly timestamp: string;
  readonly digest: string;
}
