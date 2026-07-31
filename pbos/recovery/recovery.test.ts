import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  KERNEL_COMMANDS,
  dispatchKernelCommand,
} from "../commands/kernel-command-bus";
import {
  buildPBOSRecoveryAssessment,
  formatPBOSRecoveryAssessment,
} from "./index";
import type { PBOSRecoveryEvidence } from "./types";

const now = "2026-07-30T12:00:00.000Z";

function evidence(
  overrides: Partial<PBOSRecoveryEvidence> = {}
): PBOSRecoveryEvidence {
  return {
    repository: {
      identity: "playbook-platform",
      branch: "pbos/test",
      commit: "a".repeat(40),
      working_tree: "CLEAN",
      artifact_state: "VALID",
    },
    reconciliation: {
      reconciliation_state: "REVIEW_REQUIRED",
      previous_identity: "previous-context",
      proposed_identity: "proposed-context",
      stored_identity: "previous-context",
      validation: "FAIL",
    },
    trusted: false,
    trustedContextIdentity: "historical-context",
    boundary: "INVALID",
    launchApproval: "INVALID",
    refreshApproval: "INVALID",
    refreshApprovalState: "APPLIED",
    findings: ["Current boundary is stale."],
    ...overrides,
  };
}

describe("PBOS recovery orchestrator", () => {
  it("requires recovery for blocked context", () => {
    const assessment = buildPBOSRecoveryAssessment(evidence(), now);
    expect(assessment.recovery_required).toBe(true);
    expect(assessment.recommended_transition).toBe(
      "CHANGE_BOUNDARY_REQUIRED"
    );
    expect(assessment.required_sequence.map(({ command }) => command)).toEqual([
      "npm run pbos:change-boundary",
      "npm run pbos:approve-boundary",
      "npm run pbos:approve-refresh",
      "npm run pbos:refresh",
      "npm run pbos:context-activate",
    ]);
  });

  it("requires no recovery for trusted context", () => {
    const assessment = buildPBOSRecoveryAssessment(
      evidence({
        trusted: true,
        boundary: "VALID",
        launchApproval: "VALID",
        refreshApproval: "VALID",
        refreshApprovalState: "APPLIED",
        reconciliation: {
          reconciliation_state: "VERIFIED",
          previous_identity: "current-context",
          proposed_identity: "current-context",
          stored_identity: "current-context",
          validation: "PASS",
        },
        findings: [],
      }),
      now
    );
    expect(assessment.recovery_required).toBe(false);
    expect(assessment.recommended_transition).toBe("NONE");
    expect(assessment.required_sequence).toEqual([]);
  });

  it("produces deterministic output for unchanged inputs", () => {
    const first = buildPBOSRecoveryAssessment(evidence(), now);
    const second = buildPBOSRecoveryAssessment(
      evidence(),
      "2026-07-30T13:00:00.000Z"
    );
    expect(first.digest).toBe(second.digest);
    expect(first.assessment_id).toBe(second.assessment_id);
    expect(formatPBOSRecoveryAssessment(first)).toBe(
      formatPBOSRecoveryAssessment(second)
    );
  });

  it("changes digest when assessment inputs change", () => {
    const first = buildPBOSRecoveryAssessment(evidence(), now);
    const second = buildPBOSRecoveryAssessment(
      evidence({
        repository: {
          ...evidence().repository,
          commit: "b".repeat(40),
        },
      }),
      now
    );
    expect(second.digest).not.toBe(first.digest);
  });

  it("runs the recovery command without modifying filesystem state", async () => {
    const rootDir = process.cwd();
    const before = execFileSync(
      "git",
      ["status", "--porcelain=v1", "--untracked-files=all"],
      { cwd: rootDir, encoding: "utf8" }
    );
    const result = await dispatchKernelCommand("recover", rootDir);
    const after = execFileSync(
      "git",
      ["status", "--porcelain=v1", "--untracked-files=all"],
      { cwd: rootDir, encoding: "utf8" }
    );
    expect(result.successful).toBe(true);
    expect(result.output).toContain("PBOS RECOVERY ASSESSMENT");
    expect(result.output).toContain("Mutation: NOT PERFORMED");
    expect(after).toBe(before);
  }, 15_000);

  it("preserves existing recovery command registrations", () => {
    expect(KERNEL_COMMANDS).toEqual(expect.arrayContaining([
      "context-status",
      "context-reconcile",
      "change-boundary",
      "approve-boundary",
      "approve-refresh",
      "refresh",
      "context-activate",
      "recover",
    ]));
  });
});
