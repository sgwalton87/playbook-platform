import { execFileSync } from "node:child_process";
import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import { analyzeRepository } from "../../repository";
import { loadLaunchApproval } from "../../authority/launch";
import {
  discoverTrustedContext,
  loadTrustedBuildContext,
  persistTrustedContextRecord,
  type TrustedBuildContext,
} from "../activation";
import { refreshRepositoryContext } from "../lifecycle";
import {
  loadRepositoryContextArtifact,
  loadRepositoryContextSnapshot,
} from "../loader";
import { isGovernedRuntimeOutput } from "../governed-outputs";
import { loadDevelopmentTrustLease, persistDevelopmentTrustLease } from "./store";
import type {
  DevelopmentTrustAssessment,
  DevelopmentTrustLease,
} from "./types";

export const DEVELOPMENT_TRUST_PROTECTED_SCOPES = [
  "AGENTS.md",
  "CODEX.md",
  ".github/workflows/",
  "docs/CONSTITUTION/",
  "pbos/authority/",
  "pbos/constitution/",
  "pbos/context/activation/",
  "pbos/context/development-trust/",
  "pbos/kernel/",
  "pbos/trust/",
  "supabase/migrations/",
  "package.json",
  "package-lock.json",
] as const;

function git(rootDir: string, args: readonly string[]): string {
  return execFileSync("git", args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function isAncestor(rootDir: string, ancestor: string, descendant: string): boolean {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], {
      cwd: rootDir,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function committedChanges(rootDir: string, from: string, to: string): string[] {
  if (from === to) return [];
  return git(rootDir, ["diff", "--name-only", `${from}..${to}`])
    .split("\n")
    .filter(Boolean)
    .filter((file) => !isGovernedRuntimeOutput(file))
    .sort();
}

function workingTreeChanges(rootDir: string): string[] {
  return git(rootDir, ["status", "--porcelain=v1", "--untracked-files=all"])
    .split("\n")
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/^.* -> /, ""))
    .filter((file) => !isGovernedRuntimeOutput(file))
    .sort();
}

function protectedChanges(files: readonly string[]): string[] {
  return files.filter((file) => DEVELOPMENT_TRUST_PROTECTED_SCOPES.some(
    (scope) => file === scope || file.startsWith(scope)
  ));
}

function bootstrapLease(rootDir: string, timestamp: string): DevelopmentTrustLease | null {
  const context = loadTrustedBuildContext(rootDir)?.latest ?? null;
  const repositoryContext = loadRepositoryContextArtifact(rootDir);
  const approval = loadLaunchApproval(rootDir)?.latest ?? null;
  if (!context || !repositoryContext || !approval || approval.decision !== "APPROVED") {
    return null;
  }
  const body = {
    lease_id: `DEVELOPMENT-TRUST-${artifactDigest({
      context: context.digest,
      authority: approval.digest,
    }).slice(0, 16)}`,
    repository_identity: context.repository_identity,
    remote_identity: repositoryContext.snapshot.remoteUrl,
    branch_identity: context.branch_identity,
    baseline_commit_identity: context.commit_identity,
    current_commit_identity: context.commit_identity,
    authority_identity: approval.digest,
    requester_identity: approval.requester_identity,
    reviewer_identity: approval.reviewer_identity,
    protected_scopes: [...DEVELOPMENT_TRUST_PROTECTED_SCOPES],
    issued_at: timestamp,
    expiration: context.expiration_timestamp,
    status: "ACTIVE" as const,
    advancements: [],
  };
  return persistDevelopmentTrustLease(rootDir, {
    ...body,
    digest: artifactDigest(body),
  });
}

function advanceTrustedContext(
  rootDir: string,
  previous: TrustedBuildContext,
  lease: DevelopmentTrustLease,
  changedFiles: readonly string[]
): DevelopmentTrustAssessment {
  Runtime.save(
    path.join(rootDir, Artifacts.repository),
    analyzeRepository(rootDir),
    "repository-intelligence"
  );
  const advancementTimestamp = new Date().toISOString();
  const refreshed = refreshRepositoryContext({
    rootDir,
    reason: `Automatic descendant-commit advancement under ${lease.lease_id}.`,
    now: new Date(advancementTimestamp),
  });
  const discovery = discoverTrustedContext(rootDir, advancementTimestamp);
  if (discovery.reconciliation.state !== "VERIFIED") {
    throw new Error(
      `Automatic trust advancement failed reconciliation: ${discovery.reconciliation.state}.`
    );
  }
  const contextBody: Omit<TrustedBuildContext, "digest"> = {
    context_id: discovery.assessment.assessment_id,
    repository_identity: previous.repository_identity,
    commit_identity: discovery.assessment.current_commit,
    branch_identity: previous.branch_identity,
    manifest_digest: discovery.assessment.manifest_digest ?? "",
    artifact_digest: discovery.assessment.artifact_digest,
    architecture_digest: discovery.assessment.architecture_digest,
    governance_digest: discovery.activation_snapshot.governance_digest,
    change_boundary_identity: previous.change_boundary_identity,
    launch_approval_identity: previous.launch_approval_identity,
    activation_authority_type: previous.activation_authority_type,
    activation_authority_identity: previous.activation_authority_identity,
    activation_decision_id: previous.activation_decision_id,
    created_timestamp: advancementTimestamp,
    expiration_timestamp: previous.expiration_timestamp,
    created_by: "PBOS-DEVELOPMENT-TRUST-LEASE",
  };
  const context = { ...contextBody, digest: artifactDigest(contextBody) };
  persistTrustedContextRecord(rootDir, context);
  const advancement = {
    from_commit: lease.current_commit_identity,
    to_commit: context.commit_identity,
    changed_files: [...changedFiles],
    context_identity: refreshed.context.identity,
    evidence_identity: artifactDigest({
      lease: lease.lease_id,
      from: lease.current_commit_identity,
      to: context.commit_identity,
      files: changedFiles,
      context: context.digest,
    }),
    timestamp: advancementTimestamp,
  };
  const updated = persistDevelopmentTrustLease(rootDir, {
    ...lease,
    current_commit_identity: context.commit_identity,
    advancements: [...lease.advancements, advancement],
    digest: "",
  });
  return {
    state: "ADVANCED",
    lease: updated,
    changed_files: changedFiles,
    protected_changes: [],
    findings: [],
    context_identity: context.context_id,
  };
}

export function ensureDevelopmentTrust(
  rootDir = process.cwd(),
  timestamp = new Date().toISOString()
): DevelopmentTrustAssessment {
  const snapshot = loadRepositoryContextSnapshot(rootDir);
  const context = loadTrustedBuildContext(rootDir)?.latest ?? null;
  const lease = loadDevelopmentTrustLease(rootDir) ?? bootstrapLease(rootDir, timestamp);
  if (!lease || !context) {
    return {
      state: "EXCEPTION_APPROVAL_REQUIRED", lease: null, changed_files: [],
      protected_changes: [], findings: ["An activated trusted context is required."],
      context_identity: null,
    };
  }
  if (Date.parse(lease.expiration) <= Date.parse(timestamp)) {
    return {
      state: "EXPIRED", lease, changed_files: [], protected_changes: [],
      findings: ["Development trust lease is expired."], context_identity: context.context_id,
    };
  }
  const approvalHistory = loadLaunchApproval(rootDir);
  const boundApproval = [
    ...(approvalHistory?.latest ? [approvalHistory.latest] : []),
    ...(approvalHistory?.history ?? []),
  ].find(({ digest }) => digest === lease.authority_identity) ?? null;
  const identityFindings = [
    ...(lease.status !== "ACTIVE" ? ["Development trust lease is revoked."] : []),
    ...(!boundApproval || boundApproval.decision !== "APPROVED" ||
      boundApproval.requester_identity !== lease.requester_identity ||
      boundApproval.reviewer_identity !== lease.reviewer_identity
      ? ["Development trust authority no longer matches its approval evidence."] : []),
    ...(snapshot.repositoryIdentity !== lease.repository_identity
      ? ["Repository identity changed."] : []),
    ...(snapshot.remoteUrl !== lease.remote_identity ? ["Remote identity changed."] : []),
    ...(snapshot.git.branch !== lease.branch_identity ? ["Governed branch changed."] : []),
    ...(snapshot.git.behind !== 0 ? ["Governed branch is behind its upstream."] : []),
    ...(!isAncestor(rootDir, lease.current_commit_identity, snapshot.git.commitSha)
      ? ["Current commit is not a descendant of the trusted lease."] : []),
  ];
  if (identityFindings.length > 0) {
    return {
      state: "EXCEPTION_APPROVAL_REQUIRED", lease, changed_files: [],
      protected_changes: [], findings: identityFindings, context_identity: context.context_id,
    };
  }
  const changedFiles = committedChanges(
    rootDir, lease.current_commit_identity, snapshot.git.commitSha
  );
  const protectedFiles = protectedChanges(changedFiles);
  if (protectedFiles.length > 0) {
    return {
      state: "EXCEPTION_APPROVAL_REQUIRED", lease, changed_files: changedFiles,
      protected_changes: protectedFiles,
      findings: ["Protected scope changed and requires exception approval."],
      context_identity: context.context_id,
    };
  }
  if (!snapshot.git.workingTreeClean) {
    const pendingFiles = workingTreeChanges(rootDir);
    const pendingProtectedFiles = protectedChanges(pendingFiles);
    if (pendingProtectedFiles.length > 0) {
      return {
        state: "EXCEPTION_APPROVAL_REQUIRED", lease, changed_files: pendingFiles,
        protected_changes: pendingProtectedFiles,
        findings: ["Uncommitted protected scope requires exception approval."],
        context_identity: context.context_id,
      };
    }
    return {
      state: "DEVELOPMENT_CHANGES_PENDING", lease, changed_files: pendingFiles,
      protected_changes: [], findings: ["Commit current development changes before trust advancement."],
      context_identity: context.context_id,
    };
  }
  const discovery = discoverTrustedContext(rootDir, timestamp);
  const contextCurrent = context.commit_identity === snapshot.git.commitSha &&
    context.manifest_digest === discovery.assessment.manifest_digest &&
    context.artifact_digest === discovery.assessment.artifact_digest &&
    context.architecture_digest === discovery.assessment.architecture_digest;
  if (contextCurrent) {
    return {
      state: "CURRENT", lease, changed_files: [], protected_changes: [], findings: [],
      context_identity: context.context_id,
    };
  }
  return advanceTrustedContext(rootDir, context, lease, changedFiles);
}
