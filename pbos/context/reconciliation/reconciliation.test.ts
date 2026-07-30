import { describe, expect, it } from "vitest";
import type {
  RepositoryContextArtifact,
  RepositoryContextSnapshot,
} from "../schema";
import { RepositoryContextReconciliation } from "./reconcile";

const timestamp = "2026-07-30T12:00:00.000Z";

function snapshot(
  overrides: Partial<RepositoryContextSnapshot> = {}
): RepositoryContextSnapshot {
  return {
    repositoryRoot: "/repo",
    remoteName: "origin",
    remoteUrl: "git@example.com:playbook/platform.git",
    repositoryIdentity: "playbook-platform",
    git: {
      branch: "main",
      commitSha: "a".repeat(40),
      upstream: "origin/main",
      ahead: 0,
      behind: 0,
      workingTreeClean: true,
      workingTreeDigest: "b".repeat(64),
      workingTreeContentDigest: "c".repeat(64),
    },
    runtime: {
      engineVersion: "3.0.0",
      currentGate: null,
      completedGates: [],
      activeSprint: null,
      executionMode: "planning",
    },
    artifacts: [],
    ...overrides,
  };
}

function stored(value: RepositoryContextSnapshot): RepositoryContextArtifact {
  return {
    version: "1.1.0",
    capturedAt: timestamp,
    snapshot: value,
    identity: "stored-context",
  };
}

describe("repository context reconciliation", () => {
  it("verifies identical context deterministically", () => {
    const current = snapshot();
    const reconciliation = new RepositoryContextReconciliation();
    const first = reconciliation.reconcile({
      stored: stored(current),
      current,
      timestamp,
    });
    const second = reconciliation.reconcile({
      stored: stored(current),
      current,
      timestamp,
    });
    expect(first).toEqual(second);
    expect(first.state).toBe("VERIFIED");
    expect(first.differences).toEqual([]);
  });

  it("rejects incorrect repository identity without overwriting context", () => {
    const previous = snapshot();
    const report = new RepositoryContextReconciliation().reconcile({
      stored: stored(previous),
      current: snapshot({ repositoryIdentity: "unexpected-repository" }),
      timestamp,
    });
    expect(report.state).toBe("REJECTED");
    expect(report.confidence).toBe(0);
    expect(report.differences.map(({ code }) => code)).toContain(
      "REPOSITORY_IDENTITY"
    );
    expect(report.previous_snapshot).toEqual(previous);
  });

  it("fails closed when trusted context is missing", () => {
    const report = new RepositoryContextReconciliation().reconcile({
      stored: undefined,
      current: snapshot(),
      timestamp,
    });
    expect(report.state).toBe("REJECTED");
    expect(report.differences[0]?.code).toBe("MISSING_CONTEXT");
  });

  it("requires human review for expected continuation changes", () => {
    const previous = snapshot();
    const report = new RepositoryContextReconciliation().reconcile({
      stored: stored(previous),
      current: snapshot({
        git: {
          ...previous.git,
          commitSha: "d".repeat(40),
          workingTreeContentDigest: "e".repeat(64),
        },
      }),
      timestamp,
    });
    expect(report.state).toBe("REVIEW_REQUIRED");
    expect(report.recommendation).toBe("HUMAN_REVIEW_REQUIRED");
  });
});
