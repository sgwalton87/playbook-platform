import { describe, expect, it } from "vitest";
import { ProviderOperationsControlCenter } from "./control-center";
import {
  certificationQueueViewDigest,
  evidenceStatusViewDigest,
  providerOperationsSnapshotDigest,
  providerStatusViewDigest,
  reviewerAssignmentViewDigest,
  riskFindingViewDigest,
} from "./identity";
import type { ProviderOperationsSnapshot } from "./types";

const now = "2026-07-30T12:00:00.000Z";

function snapshot(): ProviderOperationsSnapshot {
  const providerBody = {
    identity: "PROVIDER-VIEW-001",
    provider_identity: "PROVIDER-001",
    status: "IDENTIFIED",
    authority: "PBOS-PROVIDER-ADMIN",
    timestamp: now,
    digest: "",
  };
  const evidenceBody = {
    identity: "EVIDENCE-VIEW-001",
    provider_identity: "PROVIDER-001",
    evidence_reference: "EVIDENCE-001",
    status: "SUBMITTED",
    authority: "PBOS-PROVIDER-ADMIN",
    expiration: "2026-07-31T12:00:00.000Z",
    timestamp: now,
    digest: "",
  };
  const queueBody = {
    identity: "QUEUE-VIEW-001",
    provider_identity: "PROVIDER-001",
    certification_reference: "CERTIFICATION-001",
    status: "BLOCKED",
    authority: "PBOS-PROVIDER-ADMIN",
    timestamp: now,
    digest: "",
  };
  const riskBody = {
    identity: "RISK-VIEW-001",
    provider_identity: "PROVIDER-001",
    severity: "HIGH" as const,
    status: "OPEN",
    authority: "PBOS-PROVIDER-ADMIN",
    timestamp: now,
    digest: "",
  };
  const reviewerBody = {
    identity: "REVIEWER-VIEW-001",
    provider_identity: "PROVIDER-001",
    reviewer_identity: "REVIEWER-001",
    status: "ASSIGNED",
    authority: "PBOS-REVIEW-AUTHORITY",
    timestamp: now,
    digest: "",
  };
  const body: ProviderOperationsSnapshot = {
    snapshot_id: "SNAPSHOT-001",
    generated_by: "PBOS-PROVIDER-ADMIN",
    providers: [
      { ...providerBody, digest: providerStatusViewDigest(providerBody) },
    ],
    evidence: [
      { ...evidenceBody, digest: evidenceStatusViewDigest(evidenceBody) },
    ],
    certification_queue: [
      { ...queueBody, digest: certificationQueueViewDigest(queueBody) },
    ],
    risks: [{ ...riskBody, digest: riskFindingViewDigest(riskBody) }],
    reviewer_assignments: [
      {
        ...reviewerBody,
        digest: reviewerAssignmentViewDigest(reviewerBody),
      },
    ],
    audit_history: ["AUDIT-001"],
    timestamp: now,
    digest: "",
  };
  return { ...body, digest: providerOperationsSnapshotDigest(body) };
}

function controlCenter(): ProviderOperationsControlCenter {
  return new ProviderOperationsControlCenter(
    new Set(["PBOS-PROVIDER-ADMIN"]),
    new Set(["PBOS-REVIEW-AUTHORITY"])
  );
}

describe("provider operations control center", () => {
  it("creates an authorized immutable operational view", () => {
    expect(controlCenter().createSnapshot(snapshot())).toEqual(snapshot());
  });

  it("rejects unauthorized administration, evidence mutation, and review override", () => {
    expect(() =>
      controlCenter().createSnapshot({
        ...snapshot(),
        generated_by: "UNKNOWN",
      })
    ).toThrow("administrator is unauthorized");
    const current = snapshot();
    expect(() =>
      controlCenter().createSnapshot({
        ...current,
        evidence: [{ ...current.evidence[0], status: "VALIDATED" }],
      })
    ).toThrow("snapshot digest is invalid");
    expect(() =>
      controlCenter().createSnapshot({
        ...current,
        reviewer_assignments: [
          { ...current.reviewer_assignments[0], authority: "UNKNOWN" },
        ],
      })
    ).toThrow("snapshot digest is invalid");
  });
});
