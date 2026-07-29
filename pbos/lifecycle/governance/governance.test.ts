import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel";
import type { GateDefinition } from "../../planner";
import {
  completionEvidenceManifestPath,
  evaluateGateCompletionEvidence,
} from "./evidence";
import {
  appendLifecycleGovernanceHistory,
  validateLifecycleGovernanceHistory,
} from "./history";
import type { LifecycleGovernanceRun } from "./types";

const roots: string[] = [];
const evaluatedAt = "2026-07-29T06:00:00.000Z";

function write(root: string, relativePath: string, content: string): void {
  const target = path.join(root, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

function gate(): GateDefinition {
  return {
    id: "PBOS-GENERIC-001",
    title: "Generic governed gate",
    description: "Reusable lifecycle test gate.",
    status: "in_progress",
    priority: 1,
    lifecycle_stage: 1,
    dependencies: [],
    produces: [],
    requires: [],
    blocking_conditions: [],
    completion_state: "pending",
    handbook_refs: [],
    tasks: ["Implement governed capability."],
    definition_of_done: [
      "Capability evidence is identity bound.",
      "Validation passes.",
    ],
    validation: ["pbos:test"],
    next_gate: null,
  };
}

function arrange(): {
  root: string;
  gate: GateDefinition;
  manifest: Record<string, unknown>;
} {
  const root = mkdtempSync(
    path.join(tmpdir(), "pbos-lifecycle-governance-")
  );
  roots.push(root);
  const definition = gate();
  const evidencePath = "docs/release-evidence/generic-proof.md";
  const content = "# Generic Proof\n\nIdentity-bound implementation evidence.";
  write(root, evidencePath, content);
  const manifest = {
    schemaVersion: 1,
    gateId: definition.id,
    gateDigest: artifactDigest(definition),
    capturedAt: "2026-07-29T05:30:00.000Z",
    validator: {
      id: "PBOS-LIFECYCLE-EVIDENCE",
      version: "1.0.0",
    },
    evidence: [
      {
        path: evidencePath,
        digest: createHash("sha256").update(content).digest("hex"),
        capturedAt: "2026-07-29T05:30:00.000Z",
      },
    ],
    claims: definition.definition_of_done.map((requirement) => ({
      requirement,
      evidence: [evidencePath],
    })),
  };
  write(
    root,
    completionEvidenceManifestPath(definition.id),
    JSON.stringify(manifest)
  );
  return { root, gate: definition, manifest };
}

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("PBOS lifecycle completion evidence", () => {
  it("accepts complete identity-bound evidence", () => {
    const arranged = arrange();

    expect(
      evaluateGateCompletionEvidence({
        gate: arranged.gate,
        rootDir: arranged.root,
        evaluatedAt,
      }).passed
    ).toBe(true);
  });

  it("rejects missing evidence", () => {
    const arranged = arrange();
    rmSync(
      path.join(
        arranged.root,
        "docs/release-evidence/generic-proof.md"
      )
    );

    expect(
      evaluateGateCompletionEvidence({
        gate: arranged.gate,
        rootDir: arranged.root,
        evaluatedAt,
      }).passed
    ).toBe(false);
  });

  it("rejects stale evidence", () => {
    const arranged = arrange();
    (
      arranged.manifest.evidence as Array<Record<string, unknown>>
    )[0].capturedAt = "2026-01-01T00:00:00.000Z";
    write(
      arranged.root,
      completionEvidenceManifestPath(arranged.gate.id),
      JSON.stringify(arranged.manifest)
    );

    expect(
      evaluateGateCompletionEvidence({
        gate: arranged.gate,
        rootDir: arranged.root,
        evaluatedAt,
      }).blockers.some((blocker) => blocker.includes("stale"))
    ).toBe(true);
  });

  it("rejects digest mismatch and false completion claims", () => {
    const arranged = arrange();
    (
      arranged.manifest.evidence as Array<Record<string, unknown>>
    )[0].digest = "mismatch";
    arranged.manifest.claims = [
      {
        requirement: "Capability evidence is identity bound.",
        evidence: ["docs/release-evidence/generic-proof.md"],
      },
    ];
    write(
      arranged.root,
      completionEvidenceManifestPath(arranged.gate.id),
      JSON.stringify(arranged.manifest)
    );
    const result = evaluateGateCompletionEvidence({
      gate: arranged.gate,
      rootDir: arranged.root,
      evaluatedAt,
    });

    expect(result.blockers).toContain(
      "Completion evidence digest does not match: docs/release-evidence/generic-proof.md."
    );
    expect(result.blockers).toContain(
      "Definition of done is not evidenced: Validation passes."
    );
  });
});

describe("PBOS lifecycle governance history", () => {
  it("preserves attempts and rejects interrupted latest mismatch", () => {
    const run = {
      runId: "run-1",
      gateId: "PBOS-GENERIC-001",
      previousStatus: "in_progress",
      newStatus: "in_progress",
      evaluatedAt,
      authority: "lifecycle-governance",
      gateContentIdentity: "gate",
      evidenceEvaluation: {
        passed: false,
        gateId: "PBOS-GENERIC-001",
        gateDigest: "gate",
        manifestPath: "manifest",
        evidence: [],
        blockers: ["Missing evidence."],
      },
      validationEvidence: [],
      promotionEligible: false,
      promoted: false,
      completed: false,
      transition: null,
      recovery: {
        artifactsReconciled: false,
        contextRefreshed: false,
        planningRefreshed: false,
      },
      blockers: ["Missing evidence."],
    } satisfies LifecycleGovernanceRun;
    const first = appendLifecycleGovernanceHistory(null, run);
    const second = appendLifecycleGovernanceHistory(first, {
      ...run,
      runId: "run-2",
    });

    expect(second.history).toHaveLength(2);
    expect(() =>
      validateLifecycleGovernanceHistory({
        ...second,
        runId: "interrupted",
      })
    ).toThrow("history is invalid");
  });
});
