import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
} from "node:fs";
import path from "node:path";
import {
  Artifacts,
  PBOSConfig,
  RuntimeArtifactOwnership,
  artifactDigest,
} from "../kernel";
import type {
  ArtifactContext,
  RepositoryContextArtifact,
  RepositoryContextSnapshot,
  RuntimeContext,
} from "./schema";
import { loadConstitutionalGates } from "../planner/load";

interface EngineStateArtifact {
  engineVersion: string;
  currentGate: string | null;
  executionMode: string;
}

interface PlanningArtifact {
  selectedGate?: { id?: string } | null;
}

const CONTEXT_OUTPUTS = new Set([
  Artifacts.repositoryContext,
  Artifacts.contextRefresh,
  "docs/release-evidence/pbos-context-refresh.md",
  "docs/release-evidence/pbos-lifecycle-governance-report.md",
]);

function isGovernedRuntimeOutput(relativePath: string): boolean {
  return (
    relativePath.startsWith("pbos/runtime/") ||
    CONTEXT_OUTPUTS.has(relativePath)
  );
}

function git(rootDir: string, args: string[]): string {
  return execFileSync("git", args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function artifactGateId(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const direct = record.gateId ?? record.gate;

  if (typeof direct === "string") {
    return direct === "NONE" || direct === "UNKNOWN"
      ? null
      : direct;
  }

  const selected = record.selectedGate;
  if (typeof selected === "string") {
    return selected;
  }

  if (selected && typeof selected === "object") {
    const id = (selected as Record<string, unknown>).id;
    return typeof id === "string" ? id : null;
  }

  return null;
}

function artifactTimestamp(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  for (const key of [
    "generatedAt",
    "capturedAt",
    "timestamp",
    "createdAt",
    "updatedAt",
  ]) {
    if (typeof record[key] === "string") {
      return record[key];
    }
  }

  return null;
}

function loadArtifact(
  rootDir: string,
  relativePath: string
): ArtifactContext {
  const absolutePath = path.join(rootDir, relativePath);

  if (!existsSync(absolutePath)) {
    const governance = Object.values(
      RuntimeArtifactOwnership
    ).find(({ path: artifactPath }) => artifactPath === relativePath);
    return {
      path: relativePath,
      exists: false,
      gateId: null,
      branch: null,
      status: null,
      generatedAt: null,
      digest: null,
      owner: governance?.owner ?? null,
      consumers: governance?.consumers ?? [],
    };
  }

  const value = JSON.parse(
    readFileSync(absolutePath, "utf8")
  ) as unknown;
  const governance = Object.values(
    RuntimeArtifactOwnership
  ).find(({ path: artifactPath }) => artifactPath === relativePath);

  return {
    path: relativePath,
    exists: true,
    gateId: artifactGateId(value),
    branch:
      value &&
      typeof value === "object" &&
      typeof (value as Record<string, unknown>).currentBranch ===
        "string"
        ? ((value as Record<string, unknown>)
            .currentBranch as string)
        : null,
    status:
      value &&
      typeof value === "object" &&
      typeof (value as Record<string, unknown>).status ===
        "string"
        ? ((value as Record<string, unknown>).status as string)
        : null,
    generatedAt: artifactTimestamp(value),
    digest: artifactDigest(value),
    owner: governance?.owner ?? null,
    consumers: governance?.consumers ?? [],
  };
}

function loadRuntimeContext(rootDir: string): RuntimeContext {
  const state = JSON.parse(
    readFileSync(
      path.join(rootDir, "pbos/state/engine-state.json"),
      "utf8"
    )
  ) as EngineStateArtifact;
  const planning = JSON.parse(
    readFileSync(
      path.join(rootDir, Artifacts.planning),
      "utf8"
    )
  ) as PlanningArtifact;
  const completedGates = loadConstitutionalGates(rootDir)
    .filter(
      (gate) =>
        gate.status === "complete" &&
        gate.completion_state === "satisfied"
    )
    .map((gate) => gate.id)
    .sort();

  return {
    engineVersion: state.engineVersion,
    currentGate: state.currentGate,
    completedGates,
    activeSprint: planning.selectedGate?.id ?? null,
    executionMode: state.executionMode,
  };
}

export function loadRepositoryContextSnapshot(
  rootDir = process.cwd()
): RepositoryContextSnapshot {
  const repositoryRoot = git(rootDir, [
    "rev-parse",
    "--show-toplevel",
  ]);
  const branch = git(repositoryRoot, [
    "branch",
    "--show-current",
  ]);
  const commitSha = git(repositoryRoot, ["rev-parse", "HEAD"]);
  const remoteUrl = git(repositoryRoot, [
    "remote",
    "get-url",
    PBOSConfig.repository.remote,
  ]);
  let upstream: string | null = null;
  let ahead = 0;
  let behind = 0;

  try {
    upstream = git(repositoryRoot, [
      "rev-parse",
      "--abbrev-ref",
      "@{upstream}",
    ]);
    const counts = git(repositoryRoot, [
      "rev-list",
      "--left-right",
      "--count",
      `${upstream}...HEAD`,
    ]).split(/\s+/).map(Number);
    behind = counts[0] ?? 0;
    ahead = counts[1] ?? 0;
  } catch {
    upstream = null;
  }

  const workingTree = git(repositoryRoot, [
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
  ])
    .split("\n")
    .filter(
      (line) =>
        line.length > 0 &&
        !line.includes("pbos/runtime/") &&
        ![...CONTEXT_OUTPUTS].some((output) => line.endsWith(output))
    )
    .join("\n");
  const trackedDiff = git(repositoryRoot, [
    "diff",
    "--binary",
    "HEAD",
    "--",
    ".",
    ":(exclude)pbos/runtime/**",
    ":(exclude)docs/release-evidence/pbos-context-refresh.md",
    ":(exclude)docs/release-evidence/pbos-lifecycle-governance-report.md",
  ]);
  const untrackedFiles = git(repositoryRoot, [
    "ls-files",
    "--others",
    "--exclude-standard",
  ])
    .split("\n")
    .filter(
      (relativePath) =>
        relativePath.length > 0 &&
        !isGovernedRuntimeOutput(relativePath)
    )
    .sort()
    .map((relativePath) => ({
      path: relativePath,
      digest: artifactDigest(
        readFileSync(path.join(repositoryRoot, relativePath))
      ),
    }));

  const requiredArtifacts = [
    Artifacts.repository,
    Artifacts.planning,
    Artifacts.validation,
    Artifacts.execution,
    Artifacts.executionContract,
    Artifacts.workPackage,
    Artifacts.executionAuthorization,
  ];

  return {
    repositoryRoot,
    remoteName: PBOSConfig.repository.remote,
    remoteUrl,
    repositoryIdentity: path.basename(repositoryRoot),
    git: {
      branch,
      commitSha,
      upstream,
      ahead,
      behind,
      workingTreeClean: workingTree.length === 0,
      workingTreeDigest: artifactDigest(workingTree),
      workingTreeContentDigest: artifactDigest({
        trackedDiff,
        untrackedFiles,
      }),
    },
    runtime: loadRuntimeContext(repositoryRoot),
    artifacts: requiredArtifacts.map((artifact) =>
      loadArtifact(repositoryRoot, artifact)
    ),
  };
}

export function loadRepositoryContextArtifact(
  rootDir = process.cwd()
): RepositoryContextArtifact | undefined {
  const artifactPath = path.join(
    rootDir,
    Artifacts.repositoryContext
  );

  if (!existsSync(artifactPath)) {
    return undefined;
  }

  return JSON.parse(
    readFileSync(artifactPath, "utf8")
  ) as RepositoryContextArtifact;
}
