import { describe, expect, it } from "vitest";
import { ProductionProviderCertificationAuthority } from "./authority";
import {
  productionEvidenceCertificationDigest,
  productionIdentityCertificationDigest,
  productionOperationsCertificationDigest,
  productionProviderPackageDigest,
  productionRecoveryCertificationDigest,
  productionSecurityCertificationDigest,
  productionStorageCertificationDigest,
} from "./identity";
import { createKernelProductionCertificationProof } from "./kernel-adapter";
import type {
  ProductionEvidenceCertificationRecord,
  ProductionIdentityCertificationRecord,
  ProductionOperationsCertificationRecord,
  ProductionProviderCertificationPackage,
  ProductionRecoveryCertificationRecord,
  ProductionSecurityCertificationRecord,
  ProductionStorageCertificationRecord,
} from "./types";

const now = "2026-07-30T12:00:00.000Z";
const later = "2026-07-30T13:00:00.000Z";

function identity(): ProductionIdentityCertificationRecord {
  const body: ProductionIdentityCertificationRecord = {
    record_id: "IDENTITY-CERT-001",
    provider: "IDENTITY-PROVIDER",
    capability: "CAPABILITY-SCHOLAR-RECORD",
    validation_method: "SIGNED-CREDENTIAL-AND-REVOCATION",
    evidence: ["EVIDENCE-IDENTITY-001"],
    identity_resolution: true,
    credential_verification: true,
    issuer_authentication: true,
    organization_verification: true,
    tenant_ownership: true,
    authority_scope_validation: true,
    credential_status: "CURRENT",
    revocation_handling: true,
    timestamp: now,
    valid_until: later,
    status: "CERTIFIED",
    digest: "",
  };
  return { ...body, digest: productionIdentityCertificationDigest(body) };
}

function storage(): ProductionStorageCertificationRecord {
  const body: ProductionStorageCertificationRecord = {
    record_id: "STORAGE-CERT-001",
    provider: "STORAGE-PROVIDER",
    storage_model: "TRANSACTIONAL",
    transaction_support: true,
    revision_control: true,
    concurrency_handling: true,
    consistency_model: "SERIALIZABLE",
    failure_handling: true,
    recovery_model: "POINT-IN-TIME",
    backup_strategy: "ENCRYPTED-REPLICATED",
    evidence: ["EVIDENCE-STORAGE-001"],
    timestamp: now,
    status: "CERTIFIED",
    digest: "",
  };
  return { ...body, digest: productionStorageCertificationDigest(body) };
}

function evidence(): ProductionEvidenceCertificationRecord {
  const body: ProductionEvidenceCertificationRecord = {
    record_id: "EVIDENCE-CERT-001",
    provider: "EVIDENCE-PROVIDER",
    evidence_type: "GOVERNANCE",
    storage_location: "IMMUTABLE-STORE",
    integrity_method: "SHA-256-HASH-CHAIN",
    retention_policy: "ENTERPRISE-GOVERNANCE",
    immutable_storage: true,
    audit_ordering: true,
    retrieval_verified: true,
    tamper_detection: true,
    expected_digest: "a".repeat(64),
    observed_digest: "a".repeat(64),
    evidence: ["EVIDENCE-EVIDENCE-001"],
    verification_result: "PASS",
    timestamp: now,
    status: "CERTIFIED",
    digest: "",
  };
  return { ...body, digest: productionEvidenceCertificationDigest(body) };
}

function recovery(): ProductionRecoveryCertificationRecord {
  const body: ProductionRecoveryCertificationRecord = {
    record_id: "RECOVERY-CERT-001",
    provider: "RECOVERY-PROVIDER",
    backup_method: "ENCRYPTED-SNAPSHOT",
    restore_method: "VERIFIED-RESTORE",
    validation_result: "PASS",
    recovery_owner: "PBOS-SRE",
    state_verification: true,
    evidence_preservation: true,
    rollback_prevention: true,
    evidence: ["EVIDENCE-RECOVERY-001"],
    timestamp: now,
    status: "CERTIFIED",
    digest: "",
  };
  return { ...body, digest: productionRecoveryCertificationDigest(body) };
}

function operations(): ProductionOperationsCertificationRecord {
  const body: ProductionOperationsCertificationRecord = {
    record_id: "OPERATIONS-CERT-001",
    provider: "OBSERVABILITY-PROVIDER",
    metric_source: "PBOS-TELEMETRY",
    metric_names: ["capability.health", "admission.result"],
    alert_definitions: ["provider.failure", "security.revocation"],
    owner: "PBOS-SRE",
    response_process: "PBOS-INCIDENT-RESPONSE",
    security_event_logging: true,
    evidence: ["EVIDENCE-OPERATIONS-001"],
    timestamp: now,
    status: "CERTIFIED",
    digest: "",
  };
  return { ...body, digest: productionOperationsCertificationDigest(body) };
}

function security(): ProductionSecurityCertificationRecord {
  const body: ProductionSecurityCertificationRecord = {
    record_id: "SECURITY-CERT-001",
    provider: "SECURITY-PROVIDER",
    key_management: true,
    credential_rotation: true,
    access_review: true,
    revocation_propagation: true,
    incident_response: true,
    security_logging: true,
    owner: "PBOS-SECURITY",
    evidence: ["EVIDENCE-SECURITY-001"],
    timestamp: now,
    status: "CERTIFIED",
    digest: "",
  };
  return { ...body, digest: productionSecurityCertificationDigest(body) };
}

function packageValue(
  overrides: Partial<ProductionProviderCertificationPackage> = {}
): ProductionProviderCertificationPackage {
  const body: ProductionProviderCertificationPackage = {
    package_id: "PROVIDER-PACKAGE-001",
    identity: identity(),
    storage: storage(),
    evidence: evidence(),
    recovery: recovery(),
    operations: operations(),
    security: security(),
    timestamp: now,
    digest: "",
    ...overrides,
  };
  return { ...body, digest: productionProviderPackageDigest(body) };
}

describe("PBOS production provider certification", () => {
  it("certifies a complete hypothetical evidence-backed provider package", () => {
    expect(
      new ProductionProviderCertificationAuthority().certify(packageValue())
    ).toMatchObject({ status: "CERTIFIED", findings: [] });
  });

  it("blocks missing evidence, expired credentials, storage gaps, tampering, and recovery gaps", () => {
    const authority = new ProductionProviderCertificationAuthority();
    const invalidIdentity = {
      ...identity(),
      evidence: [],
      credential_status: "EXPIRED" as const,
    };
    const invalidStorage = {
      ...storage(),
      transaction_support: false,
      consistency_model: "OTHER" as const,
    };
    const tamperedEvidence = {
      ...evidence(),
      observed_digest: "b".repeat(64),
    };
    const invalidRecovery = {
      ...recovery(),
      evidence: [],
      state_verification: false,
    };
    expect(
      authority.certify(packageValue({ identity: invalidIdentity })).status
    ).toBe("BLOCKED");
    expect(
      authority.certify(packageValue({ storage: invalidStorage })).status
    ).toBe("BLOCKED");
    expect(
      authority.certify(packageValue({ evidence: tamperedEvidence })).status
    ).toBe("BLOCKED");
    const decision = authority.certify(
      packageValue({ recovery: invalidRecovery })
    );
    expect(decision.status).toBe("BLOCKED");
    expect(
      createKernelProductionCertificationProof(decision, later).status
    ).toBe("BLOCKED");
  });
});
