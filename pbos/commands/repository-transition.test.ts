import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
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
import { dispatchKernelCommand } from "./kernel-command-bus";
import { loadTransitionLifecycle } from "../transition";
import {
  ensureDevelopmentTrust,
  loadDevelopmentTrustLease,
} from "../context/development-trust";

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
  it("coordinates requester approval, reviewer approval, refresh, activation, and completion", async () => {
    const parent = mkdtempSync(path.join(tmpdir(), "pbos-transition-lifecycle-"));
    roots.push(parent);
    const clonePath = path.join(parent, "playbook-platform");
    execFileSync("git", ["clone", "--no-hardlinks", process.cwd(), clonePath], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const rootDir = realpathSync(clonePath);
    const canonicalRemote = git(process.cwd(), "remote", "get-url", "origin");
    git(rootDir, "remote", "set-url", "origin", canonicalRemote);
    git(rootDir, "branch", "main", "origin/main");
    const expiration = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const requester = await dispatchKernelCommand(
      "transition", rootDir, "", {
        "requester-identity": "REQUESTER-001",
        decision: "APPROVED",
        reason: "Approve the exact isolated repository transition.",
        "risk-acknowledgment": "YES",
        expiration,
      }
    );
    expect(requester.successful).toBe(true);
    expect(loadTransitionLifecycle(rootDir)?.latest.state).toBe("REQUESTER_APPROVED");

    const reviewer = await dispatchKernelCommand(
      "approve", rootDir, "", {
        "reviewer-identity": "REVIEWER-002",
        decision: "APPROVED",
        reason: "Independently reviewed repository and governance evidence.",
        "risk-acknowledgment": "YES",
        expiration,
      }
    );
    expect(reviewer.successful).toBe(true);
    expect(loadTransitionLifecycle(rootDir)?.latest.state).toBe("REVIEWER_APPROVED");

    const completed = await dispatchKernelCommand("transition", rootDir);
    expect(completed.successful, completed.output).toBe(true);
    expect(completed.output).toContain("PBOS TRANSITION COMPLETE");
    expect(completed.output).toContain("Proposal: APPROVED");
    expect(completed.output).toContain("Context Refresh: APPLIED");
    expect(completed.output).toContain("Trusted Context: ACTIVE");
    expect(completed.output).toContain("Validation: PASS");
    expect(completed.output).toContain("Human Authorization Ceremonies: 2");

    const lifecycle = loadTransitionLifecycle(rootDir)?.latest;
    expect(lifecycle?.state).toBe("COMPLETE");
    expect(lifecycle?.state_history.map(({ state }) => state)).toEqual([
      "DRAFT",
      "PROPOSED",
      "REQUESTER_APPROVED",
      "REVIEWER_APPROVED",
      "CONTEXT_REFRESH_PENDING",
      "CONTEXT_REFRESHED",
      "TRUSTED_CONTEXT_ACTIVE",
      "VALIDATED",
      "COMPLETE",
    ]);

    const context = await dispatchKernelCommand("context-status", rootDir);
    expect(context.successful).toBe(true);
    expect(context.output).toContain("Trust Level: ACTIVE");
    expect(context.output).toContain("Validation: PASS");

    const approvalPath = path.join(rootDir, Artifacts.launchApproval);
    const approvalArtifact = JSON.parse(readFileSync(approvalPath, "utf8")) as {
      owner: "authority-ledger";
      latest: Record<string, unknown> & { digest: string };
      history: Array<Record<string, unknown> & { digest: string }>;
      digest: string;
    };
    const priorApproval = approvalArtifact.latest;
    const newerApprovalBody = {
      ...priorApproval,
      approval_id: "LAUNCH-APPROVAL-NEWER-EVIDENCE",
      digest: undefined,
    };
    const newerApproval = {
      ...newerApprovalBody,
      digest: artifactDigest(newerApprovalBody),
    };
    const approvalBody = {
      owner: approvalArtifact.owner,
      latest: newerApproval,
      history: [...approvalArtifact.history, priorApproval],
    };
    writeFileSync(
      approvalPath,
      JSON.stringify({ ...approvalBody, digest: artifactDigest(approvalBody) }, null, 2),
      "utf8"
    );

    git(rootDir, "config", "user.email", "pbos-test@example.com");
    git(rootDir, "config", "user.name", "PBOS Test");
    mkdirSync(path.join(rootDir, "app", "trust-lease-test"), { recursive: true });
    writeFileSync(
      path.join(rootDir, "app", "trust-lease-test", "page.tsx"),
      "export default function Page() { return null; }\n",
      "utf8"
    );
    git(rootDir, "add", "app/trust-lease-test/page.tsx");
    git(rootDir, "commit", "-m", "feat: add ordinary descendant change");
    const descendantCommit = git(rootDir, "rev-parse", "HEAD");

    const advancedStatus = await dispatchKernelCommand("status", rootDir);
    expect(advancedStatus.successful).toBe(true);
    expect(advancedStatus.output).toContain("Development Trust Lease: ACTIVE");
    expect(advancedStatus.output).toContain("Trust Advancement: ADVANCED");
    expect(advancedStatus.output).toContain("Exception Approval: NOT_REQUIRED");
    expect(loadDevelopmentTrustLease(rootDir)?.current_commit_identity).toBe(
      descendantCommit
    );
    const advancedContext = await dispatchKernelCommand("context-status", rootDir);
    expect(advancedContext.successful).toBe(true);
    expect(advancedContext.output).toContain("Trust Level: ACTIVE");

    mkdirSync(path.join(rootDir, "supabase", "migrations"), { recursive: true });
    writeFileSync(
      path.join(rootDir, "supabase", "migrations", "20990101000000_test.sql"),
      "select 1;\n",
      "utf8"
    );
    git(rootDir, "add", "supabase/migrations/20990101000000_test.sql");
    git(rootDir, "commit", "-m", "test: exercise protected migration boundary");
    const exception = ensureDevelopmentTrust(rootDir);
    expect(exception.state).toBe("EXCEPTION_APPROVAL_REQUIRED");
    expect(exception.protected_changes).toEqual([
      "supabase/migrations/20990101000000_test.sql",
    ]);
  }, 60_000);

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
