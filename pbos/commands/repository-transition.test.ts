import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { Artifacts, artifactDigest } from "../kernel";
import type { ContextReconciliationReport } from "../context/reconciliation";
import type { RepositoryContextSnapshot } from "../context/schema";
import {
  createContextRefreshApproval,
  loadContextRefreshApproval,
  persistContextRefreshApproval,
  validateContextRefreshApproval,
} from "../context/refresh";
import { runRepositoryAnalysis } from "./repository";

const roots: string[] = [];

function git(rootDir: string, ...args: string[]): string {
  return execFileSync("git", args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function repository(): string {
  const rootDir = mkdtempSync(path.join(tmpdir(), "pbos-transition-repository-"));
  roots.push(rootDir);
  git(rootDir, "init", "-b", "main");
  git(rootDir, "config", "user.email", "pbos-test@example.com");
  git(rootDir, "config", "user.name", "PBOS Test");
  writeFileSync(path.join(rootDir, "tracked.txt"), "baseline\n", "utf8");
  git(rootDir, "add", "tracked.txt");
  git(rootDir, "commit", "-m", "baseline");
  return rootDir;
}

function snapshot(rootDir: string): RepositoryContextSnapshot {
  return {
    repositoryRoot: rootDir,
    remoteName: "origin",
    remoteUrl: "",
    repositoryIdentity: path.basename(rootDir),
    git: {
      branch: git(rootDir, "branch", "--show-current"),
      commitSha: git(rootDir, "rev-parse", "HEAD"),
      upstream: null,
      ahead: 0,
      behind: 0,
      workingTreeClean: true,
      workingTreeDigest: artifactDigest(""),
      workingTreeContentDigest: artifactDigest({ trackedDiff: "", untrackedFiles: [] }),
    },
    runtime: {
      engineVersion: "3.0.0",
      currentGate: null,
      completedGates: [],
      activeSprint: null,
      executionMode: "planning",
    },
    artifacts: [],
  };
}

function reconciliation(current: RepositoryContextSnapshot): ContextReconciliationReport {
  const body: Omit<ContextReconciliationReport, "digest"> = {
    reconciliation_id: "RECONCILIATION-TRANSITION-002",
    state: "REVIEW_REQUIRED",
    previous_identity: "previous-context",
    current_identity: artifactDigest(current),
    previous_snapshot: null,
    current_snapshot: current,
    differences: [],
    resolution_actions: ["Refresh the generated repository observation."],
    confidence: 70,
    risk_level: "HIGH",
    recommendation: "HUMAN_REVIEW_REQUIRED",
    timestamp: "2026-08-02T12:00:00.000Z",
  };
  return { ...body, digest: artifactDigest(body) };
}

afterEach(() => {
  for (const rootDir of roots.splice(0)) {
    rmSync(rootDir, { recursive: true, force: true });
  }
});

describe("PBOS transition repository reality synchronization", () => {
  it("refreshes repository reality before transition context discovery", () => {
    const commandBus = readFileSync(
      path.join(process.cwd(), "pbos/commands/kernel-command-bus.ts"),
      "utf8",
    );
    const transition = commandBus.slice(commandBus.indexOf('if (command === "transition")'));
    const refreshIndex = transition.indexOf("runRepositoryAnalysis(rootDir)");
    const discoveryIndex = transition.indexOf("discoverTrustedContext(rootDir, timestamp)");

    expect(refreshIndex).toBeGreaterThan(-1);
    expect(discoveryIndex).toBeGreaterThan(refreshIndex);
  });

  it("regenerates a stale repository artifact after HEAD changes", () => {
    const rootDir = repository();
    runRepositoryAnalysis(rootDir);
    const previous = JSON.parse(
      readFileSync(path.join(rootDir, Artifacts.repository), "utf8"),
    ) as { generatedAt: string; currentBranch: string; branches: Array<{ name: string; latestCommitSha: string }> };

    writeFileSync(path.join(rootDir, "tracked.txt"), "next commit\n", "utf8");
    git(rootDir, "add", "tracked.txt");
    git(rootDir, "commit", "-m", "advance head");
    const currentHead = git(rootDir, "rev-parse", "HEAD");
    previous.generatedAt = "2026-07-01T00:00:00.000Z";
    writeFileSync(
      path.join(rootDir, Artifacts.repository),
      JSON.stringify(previous, null, 2),
      "utf8",
    );

    const regenerated = runRepositoryAnalysis(rootDir).data;
    if (!regenerated) {
      throw new Error("Repository analysis did not return its generated model.");
    }

    expect(regenerated.generatedAt).not.toBe("2026-07-01T00:00:00.000Z");
    expect(regenerated.currentBranch).toBe("main");
    expect(
      regenerated.branches.find(({ name }) => name === regenerated.currentBranch)
        ?.latestCommitSha,
    ).toBe(currentHead);
  });

  it("does not mutate a valid human refresh approval", () => {
    const rootDir = repository();
    const report = reconciliation(snapshot(rootDir));
    const approval = createContextRefreshApproval({
      reconciliation: report,
      requesterIdentity: "REQUESTER-001",
      reviewerIdentity: "REVIEWER-002",
      decision: "APPROVED",
      decisionReason: "The repository transition was independently reviewed.",
      riskAcknowledgment: "Repository transition risk is accepted.",
      timestamp: "2026-08-02T12:00:00.000Z",
      expiration: "2026-08-02T14:00:00.000Z",
    });
    persistContextRefreshApproval(rootDir, approval);

    runRepositoryAnalysis(rootDir);

    expect(loadContextRefreshApproval(rootDir)?.latest).toEqual(approval);
    expect(validateContextRefreshApproval({
      approval,
      reconciliation: report,
      timestamp: "2026-08-02T12:30:00.000Z",
    })).toEqual({ valid: true, findings: [] });
  });

  it("fails approval validation closed for repository, branch, and commit drift", () => {
    const rootDir = repository();
    const approvedReport = reconciliation(snapshot(rootDir));
    const approval = createContextRefreshApproval({
      reconciliation: approvedReport,
      requesterIdentity: "REQUESTER-001",
      reviewerIdentity: "REVIEWER-002",
      decision: "APPROVED",
      decisionReason: "The repository transition was independently reviewed.",
      riskAcknowledgment: "Repository transition risk is accepted.",
      timestamp: "2026-08-02T12:00:00.000Z",
      expiration: "2026-08-02T14:00:00.000Z",
    });
    const drifted = snapshot(rootDir);
    drifted.repositoryIdentity = "incorrect-repository";
    drifted.git.branch = "incorrect-branch";
    drifted.git.commitSha = "f".repeat(40);

    const validation = validateContextRefreshApproval({
      approval,
      reconciliation: reconciliation(drifted),
      timestamp: "2026-08-02T12:30:00.000Z",
    });

    expect(validation.valid).toBe(false);
    expect(validation.findings).toEqual(expect.arrayContaining([
      "Refresh approval repository identity does not match.",
      "Refresh approval branch identity does not match.",
      "Refresh approval commit identity does not match.",
    ]));
  });
});
