import { describe, expect, it } from "vitest";
import { CapabilityProductionBridgeAuthority } from "./bridge";
import { productionProofDigest } from "./identity";
import type {
  ProductionEvidenceAdapter,
  ProductionIdentityAdapter,
  ProductionObservabilityAdapter,
  ProductionProof,
  ProductionRecoveryAdapter,
  ProductionStorageAdapter,
} from "./types";

const observedAt = "2026-07-30T12:00:00.000Z";
const validUntil = "2026-07-30T12:05:00.000Z";

function proof(
  id: string,
  status: ProductionProof["status"] = "VERIFIED"
): ProductionProof {
  const body: ProductionProof = {
    proof_id: `PROOF-${id}`,
    adapter_id: `ADAPTER-${id}`,
    subject_id: id,
    status,
    evidence_references: [`EVIDENCE-${id}`],
    observed_at: observedAt,
    valid_until: validUntil,
    digest: "",
  };
  return { ...body, digest: productionProofDigest(body) };
}

function adapters(status: ProductionProof["status"] = "VERIFIED") {
  const identity: ProductionIdentityAdapter = {
    adapter_id: "IDENTITY",
    lookupIdentity: () => proof("IDENTITY", status),
    verifyCredential: () => proof("CREDENTIAL", status),
    verifyIssuer: () => proof("ISSUER", status),
    resolveAuthority: () => proof("AUTHORITY", status),
  };
  const storage: ProductionStorageAdapter = {
    adapter_id: "STORAGE",
    consistency: "SERIALIZABLE",
    currentRevision: () => 1,
    transact: () => proof("TRANSACTION", status),
    health: () => proof("STORAGE", status),
  };
  const evidence: ProductionEvidenceAdapter = {
    adapter_id: "EVIDENCE",
    append: () => proof("EVIDENCE-APPEND", status),
    retrieve: () => null,
    verifyChain: () => proof("EVIDENCE-CHAIN", status),
  };
  const observability: ProductionObservabilityAdapter = {
    adapter_id: "OBSERVABILITY",
    emitMetric: () => proof("METRIC", status),
    emitAlert: () => proof("ALERT", status),
    emitSecurityEvent: () => proof("SECURITY", status),
    health: () => proof("OBSERVABILITY", status),
  };
  const recovery: ProductionRecoveryAdapter = {
    adapter_id: "RECOVERY",
    backup: () => proof("BACKUP", status),
    restore: () => proof("RESTORE", status),
    verifyState: () => proof("RECOVERY", status),
    health: () => proof("RECOVERY-HEALTH", status),
  };
  return { identity, storage, evidence, observability, recovery };
}

function assess(
  overrides: Partial<ReturnType<typeof adapters>> = {}
) {
  return new CapabilityProductionBridgeAuthority().assess({
    bridge_id: "BRIDGE-001",
    environment: "PRODUCTION",
    identity_id: "IDENTITY-001",
    credential_reference: "CREDENTIAL-001",
    issuer_id: "ISSUER-001",
    resource_id: "CAPABILITY-001",
    operation: "capability.execute",
    state_digest: "a".repeat(64),
    observed_at: observedAt,
    ...adapters(),
    ...overrides,
  });
}

describe("PBOS production adapter boundary", () => {
  it("accepts complete current proofs from supported adapters", () => {
    expect(assess().decision).toMatchObject({
      status: "READY",
      findings: [],
      authority: "PBOS-CAPABILITY-PRODUCTION-BRIDGE",
    });
  });

  it("rejects unknown identity, tampered proof, and unsupported storage", () => {
    expect(
      assess({ identity: adapters("UNAVAILABLE").identity }).decision.status
    ).toBe("BLOCKED");
    const tampered = adapters();
    tampered.recovery.verifyState = () => ({
      ...proof("RECOVERY"),
      subject_id: "TAMPERED",
    });
    expect(assess({ recovery: tampered.recovery }).decision.status).toBe(
      "BLOCKED"
    );
    expect(
      assess({
        storage: { ...adapters().storage, consistency: "UNSUPPORTED" },
      }).decision.status
    ).toBe("BLOCKED");
  });
});
