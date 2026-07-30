import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { artifactDigest, canonicalJson } from "../../kernel/identity";
import {
  issuerTrustDecisionDigest,
  type IssuerTrustDecision,
} from "../issuer-trust";
import {
  createDurableCapabilityControlPlane,
  createCapabilityActivationDecisionRecord,
  createCapabilityGovernanceEvidenceRecord,
  createCapabilityIssuerRecord,
  createCapabilityLifecycleTransitionRecord,
  createCapabilityRegistryRecord,
  createCapabilityRevocationRecord,
  createPersistentEntitlementRecord,
  type CapabilityIssuerRecord,
  type PersistentCapabilityLifecycleState,
  type PersistentEntitlementRecord,
} from ".";
import type { DurableCapabilityControlPlane } from "./control-plane";

const directories: string[] = [];
const initialTime = "2026-07-29T00:00:00.000Z";
const expiry = "2027-07-29T00:00:00.000Z";

function harness(): {
  directory: string;
  path: string;
  controlPlane: DurableCapabilityControlPlane;
} {
  const directory = mkdtempSync(join(tmpdir(), "pbos-capability-control-"));
  directories.push(directory);
  const path = join(directory, "capability-control-plane.json");
  return {
    directory,
    path,
    controlPlane: createDurableCapabilityControlPlane(path, {
      capability_registration: ["AUTHORITY-CAPABILITY"],
      issuer_registration: ["AUTHORITY-ISSUER"],
      revocation: ["AUTHORITY-REVOCATION"],
      activation_decision: ["AUTHORITY-DECISION"],
      evidence: ["AUTHORITY-EVIDENCE"],
    }),
  };
}

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function capabilityRecord() {
  return createCapabilityRegistryRecord({
    record_revision: 1,
    capability_id: "CAPABILITY-SCHOLAR-RECORD",
    name: "Scholar Record",
    description: "Provide governed Scholar Record access.",
    owning_engine: "PBOS-ENGINE-SCHOLAR-RECORD",
    owner_identity: "PLAYBOOK-SCHOLAR-RECORD-OWNER",
    classification: "FOUNDATION",
    version: "1.0.0",
    dependencies: [],
    security_requirements: ["SECURITY-TENANT-ISOLATION"],
    evidence_requirements: ["EVIDENCE-CAPABILITY-APPROVAL"],
    lifecycle_state: "PROPOSED",
    approval_authority: "AUTHORITY-CAPABILITY",
    created_at: "2026-07-29T01:00:00.000Z",
    updated_at: "2026-07-29T01:00:00.000Z",
  });
}

function issuerRecord(
  overrides: Partial<Omit<CapabilityIssuerRecord, "content_digest">> = {}
) {
  return createCapabilityIssuerRecord({
    record_revision: 1,
    issuer_id: "ISSUER-INSTITUTION-001",
    identity: "WORKLOAD-ENTITLEMENT-ISSUER-001",
    organization: "ORGANIZATION-001",
    tenant_id: "TENANT-001",
    authority_scope: ["entitlement.issue"],
    allowed_capabilities: ["CAPABILITY-SCHOLAR-RECORD"],
    verification_status: "VERIFIED",
    lifecycle_state: "ACTIVE",
    issued_credentials: ["CREDENTIAL-ISSUER-001"],
    valid_from: initialTime,
    expires_at: expiry,
    created_at: initialTime,
    updated_at: initialTime,
    ...overrides,
  });
}

function entitlementRecord(
  overrides: Partial<Omit<PersistentEntitlementRecord, "content_digest">> = {}
) {
  return createPersistentEntitlementRecord({
    record_revision: 1,
    entitlement_id: "ENTITLEMENT-001",
    subject_id: "SCHOLAR-001",
    organization_id: "ORGANIZATION-001",
    tenant_id: "TENANT-001",
    capability_id: "CAPABILITY-SCHOLAR-RECORD",
    issuer_id: "ISSUER-INSTITUTION-001",
    source_type: "SCHOOL_LICENSE",
    status: "ACTIVE",
    issued_at: "2026-07-29T06:00:00.000Z",
    expires_at: expiry,
    revoked_at: null,
    policy_reference: "POLICY-SCHOLAR-RECORD-001",
    evidence_reference: "EVIDENCE-ENTITLEMENT-001",
    ...overrides,
  });
}

function issuerTrustArgs(
  entitlement: PersistentEntitlementRecord,
  issuer = issuerRecord()
) {
  const body: IssuerTrustDecision = {
    decision_id: `ISSUER-TRUST-${entitlement.entitlement_id}`,
    request_id: `ISSUER-TRUST-REQUEST-${entitlement.entitlement_id}`,
    issuer_id: entitlement.issuer_id,
    capability_id: entitlement.capability_id,
    organization_id: entitlement.organization_id ?? "",
    tenant_id: entitlement.tenant_id,
    operation: "entitlement.issue",
    outcome: "TRUSTED",
    authority_identity: "PBOS-CAPABILITY-ISSUER-TRUST",
    findings: [],
    identity_evidence_reference: issuer.identity,
    credential_evidence_reference: issuer.issued_credentials[0] ?? "",
    authority_evidence_reference: "AUTHORITY-ISSUER-TRUST",
    timestamp: entitlement.issued_at,
    digest: "",
  };
  const issuerTrust = { ...body, digest: issuerTrustDecisionDigest(body) };
  const payload = canonicalJson(issuerTrust);
  return {
    issuer_trust: issuerTrust,
    issuer_evidence: createCapabilityGovernanceEvidenceRecord({
      evidence_id: `EVIDENCE-${issuerTrust.decision_id}`,
      subject_id: issuerTrust.decision_id,
      event_id: issuerTrust.decision_id,
      authority_id: issuerTrust.authority_identity,
      source_evidence_ids: [issuerTrust.digest],
      payload,
      payload_digest: artifactDigest(payload),
      recorded_at: entitlement.issued_at,
    }),
  };
}

function transition(
  from: PersistentCapabilityLifecycleState,
  to: PersistentCapabilityLifecycleState,
  index: number
) {
  return createCapabilityLifecycleTransitionRecord({
    transition_id: `CAPABILITY-TRANSITION-${index}`,
    capability_id: "CAPABILITY-SCHOLAR-RECORD",
    previous_state: from,
    new_state: to,
    authorized_actor: "AUTHORITY-CAPABILITY",
    reason: `Advance capability to ${to}.`,
    evidence_ids: [`EVIDENCE-TRANSITION-${index}`],
    validation_ids: [`VALIDATION-TRANSITION-${index}`],
    timestamp: `2026-07-29T0${index + 1}:00:00.000Z`,
  });
}

function initializeAvailableCapability(
  controlPlane: DurableCapabilityControlPlane
): number {
  controlPlane.initialize(initialTime);
  controlPlane.registerCapability({
    record: capabilityRecord(),
    authority_id: "AUTHORITY-CAPABILITY",
    event_id: "EVENT-CAPABILITY-REGISTERED",
    expected_revision: 0,
  });
  const steps: readonly [
    PersistentCapabilityLifecycleState,
    PersistentCapabilityLifecycleState,
  ][] = [
    ["PROPOSED", "DESIGNED"],
    ["DESIGNED", "APPROVED"],
    ["APPROVED", "AVAILABLE"],
  ];
  steps.forEach(([from, to], index) => {
    controlPlane.transitionCapability({
      transition: transition(from, to, index + 1),
      expected_revision: index + 1,
    });
  });
  return 4;
}

function registerIssuerAndEntitlement(
  controlPlane: DurableCapabilityControlPlane,
  issuer = issuerRecord(),
  entitlement = entitlementRecord()
): number {
  let revision = initializeAvailableCapability(controlPlane);
  controlPlane.registerIssuer({
    record: issuer,
    registration_authority_id: "AUTHORITY-ISSUER",
    event_id: "EVENT-ISSUER-REGISTERED",
    evidence_ids: ["EVIDENCE-ISSUER-VERIFICATION"],
    expected_revision: revision,
  });
  revision += 1;
  controlPlane.issueEntitlement({
    record: entitlement,
    ...issuerTrustArgs(entitlement, issuer),
    event_id: "EVENT-ENTITLEMENT-ISSUED",
    expected_revision: revision,
  });
  return revision + 1;
}

describe("PBOS durable capability control plane", () => {
  it("persists capability records and append-only lifecycle history", () => {
    const { path, controlPlane } = harness();
    const revision = initializeAvailableCapability(controlPlane);
    const reopened = createDurableCapabilityControlPlane(path, {
        capability_registration: ["AUTHORITY-CAPABILITY"],
        issuer_registration: ["AUTHORITY-ISSUER"],
        revocation: ["AUTHORITY-REVOCATION"],
        activation_decision: ["AUTHORITY-DECISION"],
        evidence: ["AUTHORITY-EVIDENCE"],
      });
    const state = reopened.state();

    expect(state.revision).toBe(revision);
    expect(state.capabilities).toHaveLength(4);
    expect(state.capability_transitions).toHaveLength(3);
    expect(state.capabilities.at(-1)?.lifecycle_state).toBe("AVAILABLE");
    expect(state.events).toHaveLength(revision);
    expect(reopened.health()).toMatchObject({
      capability_count: 1,
      available_capability_count: 1,
    });
  });

  it("persists scoped entitlements from authenticated trusted issuers", () => {
    const { controlPlane } = harness();
    registerIssuerAndEntitlement(controlPlane);

    expect(
      controlPlane.eligibleEntitlement({
        entitlement_id: "ENTITLEMENT-001",
        subject_id: "SCHOLAR-001",
        capability_id: "CAPABILITY-SCHOLAR-RECORD",
        organization_id: "ORGANIZATION-001",
        tenant_id: "TENANT-001",
        evaluated_at: "2026-08-01T00:00:00.000Z",
      })
    ).toMatchObject({
      entitlement_id: "ENTITLEMENT-001",
      status: "ACTIVE",
      issuer_id: "ISSUER-INSTITUTION-001",
    });
    expect(controlPlane.health()).toMatchObject({
      active_entitlement_count: 1,
      trusted_issuer_count: 1,
    });
  });

  it("rejects unknown, unauthorized, and cross-tenant issuers", () => {
    const unknown = harness().controlPlane;
    let revision = initializeAvailableCapability(unknown);
    expect(() =>
      unknown.issueEntitlement({
        record: entitlementRecord(),
        ...issuerTrustArgs(entitlementRecord()),
        event_id: "EVENT-UNKNOWN-ISSUER",
        expected_revision: revision,
      })
    ).toThrow("Entitlement issuer is unknown.");

    const scoped = harness().controlPlane;
    revision = initializeAvailableCapability(scoped);
    scoped.registerIssuer({
      record: issuerRecord({
        authority_scope: ["entitlement.observe"],
        tenant_id: "TENANT-002",
      }),
      registration_authority_id: "AUTHORITY-ISSUER",
      event_id: "EVENT-SCOPED-ISSUER",
      evidence_ids: ["EVIDENCE-ISSUER"],
      expected_revision: revision,
    });
    expect(() =>
      scoped.issueEntitlement({
        record: entitlementRecord(),
        ...issuerTrustArgs(
          entitlementRecord(),
          issuerRecord({
            authority_scope: ["entitlement.observe"],
            tenant_id: "TENANT-002",
          })
        ),
        event_id: "EVENT-SCOPE-VIOLATION",
        expected_revision: revision + 1,
      })
    ).toThrow("Entitlement issuer scope does not permit capability.");

    const crossTenant = harness().controlPlane;
    revision = initializeAvailableCapability(crossTenant);
    crossTenant.registerIssuer({
      record: issuerRecord({ tenant_id: "TENANT-002" }),
      registration_authority_id: "AUTHORITY-ISSUER",
      event_id: "EVENT-CROSS-TENANT-ISSUER",
      evidence_ids: ["EVIDENCE-ISSUER"],
      expected_revision: revision,
    });
    expect(() =>
      crossTenant.issueEntitlement({
        record: entitlementRecord(),
        ...issuerTrustArgs(
          entitlementRecord(),
          issuerRecord({ tenant_id: "TENANT-002" })
        ),
        event_id: "EVENT-CROSS-TENANT-GRANT",
        expected_revision: revision + 1,
      })
    ).toThrow(
      "Entitlement issuer organization or tenant scope differs."
    );
  });

  it("rejects duplicate active grants for the same scoped capability", () => {
    const { controlPlane } = harness();
    const revision = registerIssuerAndEntitlement(controlPlane);
    expect(() =>
      controlPlane.issueEntitlement({
        record: entitlementRecord({
          entitlement_id: "ENTITLEMENT-002",
        }),
        ...issuerTrustArgs(
          entitlementRecord({ entitlement_id: "ENTITLEMENT-002" })
        ),
        event_id: "EVENT-DUPLICATE-GRANT",
        expected_revision: revision,
      })
    ).toThrow("Duplicate active entitlement grant is prohibited.");
  });

  it("denies expired and revoked entitlements", () => {
    const expired = harness().controlPlane;
    registerIssuerAndEntitlement(
      expired,
      issuerRecord(),
      entitlementRecord({ expires_at: "2026-07-30T00:00:00.000Z" })
    );
    expect(() =>
      expired.eligibleEntitlement({
        entitlement_id: "ENTITLEMENT-001",
        subject_id: "SCHOLAR-001",
        capability_id: "CAPABILITY-SCHOLAR-RECORD",
        organization_id: "ORGANIZATION-001",
        tenant_id: "TENANT-001",
        evaluated_at: "2026-08-01T00:00:00.000Z",
      })
    ).toThrow("Entitlement is expired, suspended, or revoked.");

    const revoked = harness().controlPlane;
    const revision = registerIssuerAndEntitlement(revoked);
    revoked.revoke({
      record: createCapabilityRevocationRecord({
        revocation_id: "REVOCATION-ENTITLEMENT-001",
        target_type: "ENTITLEMENT",
        target_id: "ENTITLEMENT-001",
        authority_id: "AUTHORITY-REVOCATION",
        reason: "Entitlement authority revoked access.",
        evidence_ids: ["EVIDENCE-REVOCATION-001"],
        revoked_at: "2026-08-01T00:00:00.000Z",
      }),
      validation_ids: ["VALIDATION-REVOCATION-001"],
      expected_revision: revision,
    });
    expect(() =>
      revoked.eligibleEntitlement({
        entitlement_id: "ENTITLEMENT-001",
        subject_id: "SCHOLAR-001",
        capability_id: "CAPABILITY-SCHOLAR-RECORD",
        organization_id: "ORGANIZATION-001",
        tenant_id: "TENANT-001",
        evaluated_at: "2026-08-02T00:00:00.000Z",
      })
    ).toThrow("Entitlement is expired, suspended, or revoked.");
    expect(revoked.state().entitlements).toHaveLength(2);
  });

  it("propagates issuer and organization revocation to future access", () => {
    const { controlPlane } = harness();
    let revision = registerIssuerAndEntitlement(controlPlane);
    controlPlane.revoke({
      record: createCapabilityRevocationRecord({
        revocation_id: "REVOCATION-ISSUER-001",
        target_type: "ISSUER",
        target_id: "ISSUER-INSTITUTION-001",
        authority_id: "AUTHORITY-REVOCATION",
        reason: "Issuer trust was revoked.",
        evidence_ids: ["EVIDENCE-ISSUER-REVOCATION"],
        revoked_at: "2026-08-01T00:00:00.000Z",
      }),
      validation_ids: ["VALIDATION-ISSUER-REVOCATION"],
      expected_revision: revision,
    });
    revision += 1;
    expect(() =>
      controlPlane.eligibleEntitlement({
        entitlement_id: "ENTITLEMENT-001",
        subject_id: "SCHOLAR-001",
        capability_id: "CAPABILITY-SCHOLAR-RECORD",
        organization_id: "ORGANIZATION-001",
        tenant_id: "TENANT-001",
        evaluated_at: "2026-08-02T00:00:00.000Z",
      })
    ).toThrow("Entitlement is blocked by revocation.");
    expect(controlPlane.health()).toMatchObject({
      trusted_issuer_count: 0,
      security_event_count: 1,
    });
    expect(controlPlane.state().revision).toBe(revision);
  });

  it("suspends a capability through governed revocation propagation", () => {
    const { controlPlane } = harness();
    const revision = registerIssuerAndEntitlement(controlPlane);
    controlPlane.revoke({
      record: createCapabilityRevocationRecord({
        revocation_id: "REVOCATION-CAPABILITY-001",
        target_type: "CAPABILITY",
        target_id: "CAPABILITY-SCHOLAR-RECORD",
        authority_id: "AUTHORITY-REVOCATION",
        reason: "Security review suspended capability access.",
        evidence_ids: ["EVIDENCE-CAPABILITY-SUSPENSION"],
        revoked_at: "2026-08-01T00:00:00.000Z",
      }),
      validation_ids: ["VALIDATION-CAPABILITY-SUSPENSION"],
      expected_revision: revision,
    });
    expect(controlPlane.state().capabilities.at(-1)?.lifecycle_state).toBe(
      "SUSPENDED"
    );
    expect(controlPlane.state().capability_transitions.at(-1)).toMatchObject({
      previous_state: "AVAILABLE",
      new_state: "SUSPENDED",
    });
    expect(() =>
      controlPlane.eligibleEntitlement({
        entitlement_id: "ENTITLEMENT-001",
        subject_id: "SCHOLAR-001",
        capability_id: "CAPABILITY-SCHOLAR-RECORD",
        organization_id: "ORGANIZATION-001",
        tenant_id: "TENANT-001",
        evaluated_at: "2026-08-02T00:00:00.000Z",
      })
    ).toThrow("Entitlement is blocked by revocation.");
  });

  it("requires lifecycle authority and exact current state", () => {
    const { controlPlane } = harness();
    controlPlane.initialize(initialTime);
    controlPlane.registerCapability({
      record: capabilityRecord(),
      authority_id: "AUTHORITY-CAPABILITY",
      event_id: "EVENT-CAPABILITY-REGISTERED",
      expected_revision: 0,
    });
    const unauthorized = createCapabilityLifecycleTransitionRecord({
      ...transition("PROPOSED", "DESIGNED", 1),
      authorized_actor: "UNKNOWN-AUTHORITY",
    });
    expect(() =>
      controlPlane.transitionCapability({
        transition: unauthorized,
        expected_revision: 1,
      })
    ).toThrow("capability transition authority is not recognized.");
    expect(() =>
      controlPlane.transitionCapability({
        transition: transition("DESIGNED", "APPROVED", 2),
        expected_revision: 1,
      })
    ).toThrow(
      "Capability transition state or authority does not match current truth."
    );
  });

  it("preserves immutable activation decisions and Kernel references", () => {
    const { controlPlane } = harness();
    controlPlane.initialize(initialTime);
    const payload = canonicalJson({
      decision_id: "DECISION-ACTIVATION-001",
      outcome: "ALLOW",
    });
    const evidence = createCapabilityGovernanceEvidenceRecord({
      evidence_id: "EVIDENCE-ACTIVATION-001",
      subject_id: "DECISION-ACTIVATION-001",
      event_id: "DECISION-ACTIVATION-001",
      authority_id: "AUTHORITY-DECISION",
      source_evidence_ids: ["EVIDENCE-ENTITLEMENT-001"],
      payload,
      payload_digest: artifactDigest(payload),
      recorded_at: initialTime,
    });
    const decision = createCapabilityActivationDecisionRecord({
      decision_id: "DECISION-ACTIVATION-001",
      subject: "SCHOLAR-001",
      organization_id: "ORGANIZATION-001",
      tenant_id: "TENANT-001",
      capability: "CAPABILITY-SCHOLAR-RECORD",
      capability_digest: "a".repeat(64),
      entitlement_reference: "ENTITLEMENT-001",
      policy_result: "ALLOW",
      authority_result: "AUTHORIZED",
      kernel_reference: "KERNEL-ADMISSION-001",
      decision: "ALLOW",
      timestamp: initialTime,
      evidence_digest: evidence.content_digest,
    });
    controlPlane.recordActivationDecision({
      record: decision,
      evidence,
      authority_id: "AUTHORITY-DECISION",
      expected_revision: 0,
    });
    expect(controlPlane.state().activation_decisions).toEqual([decision]);
    expect(() =>
      controlPlane.recordActivationDecision({
        record: decision,
        evidence,
        authority_id: "AUTHORITY-DECISION",
        expected_revision: 1,
      })
    ).toThrow("Activation decision or evidence identity already exists.");
    expect(decision).not.toHaveProperty("execution");
    expect(decision.kernel_reference).toBe("KERNEL-ADMISSION-001");
  });

  it("rejects stale revisions and concurrent write-lock ambiguity", () => {
    const { path, controlPlane } = harness();
    controlPlane.initialize(initialTime);
    controlPlane.registerCapability({
      record: capabilityRecord(),
      authority_id: "AUTHORITY-CAPABILITY",
      event_id: "EVENT-CAPABILITY-REGISTERED",
      expected_revision: 0,
    });
    expect(() =>
      controlPlane.transitionCapability({
        transition: transition("PROPOSED", "DESIGNED", 1),
        expected_revision: 0,
      })
    ).toThrow("revision conflict");

    writeFileSync(`${path}.lock`, "occupied", "utf8");
    expect(() =>
      controlPlane.transitionCapability({
        transition: transition("PROPOSED", "DESIGNED", 1),
        expected_revision: 1,
      })
    ).toThrow("write lock is unavailable");
    rmSync(`${path}.lock`);
  });

  it("fails closed when persisted state or audit history is altered", () => {
    const { directory, path, controlPlane } = harness();
    initializeAvailableCapability(controlPlane);
    const value = JSON.parse(readFileSync(path, "utf8")) as {
      capabilities: Array<{ name: string }>;
    };
    value.capabilities[0].name = "Altered Capability";
    mkdirSync(directory, { recursive: true });
    writeFileSync(path, JSON.stringify(value), "utf8");

    expect(() => controlPlane.state()).toThrow(
      "Capability control-plane state validation failed"
    );
  });
});
