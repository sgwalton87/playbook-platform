import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createDurableCapabilityControlPlane } from "../persistence";
import {
  CapabilityProductionReadinessAuthority,
  capabilityProductionReadinessDigest,
} from "./readiness";
import {
  CapabilityProductionCertificationAuthority,
  capabilityReadinessAssessmentDigest,
} from "./certification";
import { collectCapabilityOperationalMetrics } from "./metrics";
import type {
  CapabilityProductionReadinessContract,
  CapabilityProductionReadinessAssessment,
  CapabilityReadinessDomain,
  OperationalControlEvidence,
} from "./types";

const directories: string[] = [];
const timestamp = "2026-07-29T12:00:00.000Z";

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function control(id: string, verified = true): OperationalControlEvidence {
  return {
    control_id: id,
    verified,
    owner_identity: "PBOS-PLATFORM-OPERATIONS",
    evidence_references: [`EVIDENCE-${id}`],
    verified_at: timestamp,
  };
}

function contract(
  verified = true
): CapabilityProductionReadinessContract {
  const body: CapabilityProductionReadinessContract = {
    contract_id: "PRODUCTION-READINESS-001",
    environment: "PRODUCTION",
    observed_at: timestamp,
    storage: {
      transactional: control("TRANSACTIONAL-STORAGE", verified),
      replication: control("REPLICATION", verified),
      concurrency: control("CONCURRENCY", verified),
      partition_handling: control("PARTITION-HANDLING", verified),
      conflict_resolution: control("CONFLICT-RESOLUTION", verified),
    },
    recovery: {
      backup: control("BACKUP", verified),
      restore_test: control("RESTORE-TEST", verified),
      disaster_recovery: control("DISASTER-RECOVERY", verified),
      rpo_minutes: 15,
      rto_minutes: 60,
    },
    operations: {
      monitoring: control("MONITORING", verified),
      alerting: control("ALERTING", verified),
      failure_handling: control("FAILURE-HANDLING", verified),
      audit_retention: control("AUDIT-RETENTION", verified),
      performance_measurement: control("PERFORMANCE", verified),
    },
    security: {
      credential_rotation: control("CREDENTIAL-ROTATION", verified),
      revocation_propagation: control("REVOCATION-PROPAGATION", verified),
      incident_response: control("INCIDENT-RESPONSE", verified),
      access_review: control("ACCESS-REVIEW", verified),
      audit_review: control("AUDIT-REVIEW", verified),
    },
    service_objectives: {
      availability_percent: 99.9,
      admission_latency_ms: 250,
      recovery_event_budget: 1,
      evidence_reference: "EVIDENCE-SERVICE-OBJECTIVES",
    },
    digest: "",
  };
  return { ...body, digest: capabilityProductionReadinessDigest(body) };
}

describe("PBOS capability production operations", () => {
  it("fails closed until every operational control is verified", () => {
    const decision = new CapabilityProductionReadinessAuthority().evaluate(
      contract(false)
    );
    expect(decision.status).toBe("BLOCKED");
    expect(decision.findings.length).toBeGreaterThan(0);
  });

  it("reports READY only for complete evidence-backed controls", () => {
    expect(
      new CapabilityProductionReadinessAuthority().evaluate(contract())
    ).toMatchObject({ status: "READY", findings: [] });
  });

  it("collects deterministic control-plane operational metrics", () => {
    const directory = mkdtempSync(join(tmpdir(), "pbos-operations-"));
    directories.push(directory);
    const plane = createDurableCapabilityControlPlane(
      join(directory, "control-plane.json"),
      {
        capability_registration: ["AUTHORITY-CAPABILITY"],
        issuer_registration: ["AUTHORITY-ISSUER"],
        revocation: ["AUTHORITY-REVOCATION"],
        activation_decision: ["AUTHORITY-DECISION"],
        evidence: ["AUTHORITY-EVIDENCE"],
      }
    );
    plane.initialize(timestamp);
    expect(collectCapabilityOperationalMetrics(plane)).toMatchObject({
      revision: 0,
      capability_inventory: 0,
      active_entitlements: 0,
      admission_total: 0,
      security_events: 0,
      recovery_events: 0,
    });
  });

  it("certifies only one complete approved assessment per domain", () => {
    const domains: readonly CapabilityReadinessDomain[] = [
      "IDENTITY",
      "ISSUER",
      "STORAGE",
      "EVIDENCE",
      "RECOVERY",
      "OBSERVABILITY",
      "SECURITY",
      "PERFORMANCE",
    ];
    const assessments = domains.map((domain) => {
      const body: CapabilityProductionReadinessAssessment = {
        assessment_id: `ASSESSMENT-${domain}`,
        domain,
        requirement: `${domain} production requirement`,
        current_state: "IMPLEMENTED",
        evidence: [`EVIDENCE-${domain}`],
        validation: "PASS",
        risk: "LOW",
        approval_state: "APPROVED",
        assessed_at: timestamp,
        assessor_identity: "PBOS-PRODUCTION-REVIEW",
        digest: "",
      };
      return {
        ...body,
        digest: capabilityReadinessAssessmentDigest(body),
      };
    });
    const authority = new CapabilityProductionCertificationAuthority();
    expect(authority.certify(assessments, timestamp).status).toBe("CERTIFIED");
    expect(
      authority.certify(
        assessments.map((assessment, index) =>
          index === 2
            ? {
                ...assessment,
                current_state: "PARTIAL" as const,
                validation: "FAIL" as const,
              }
            : assessment
        ),
        timestamp
      ).status
    ).toBe("BLOCKED");
  });
});
