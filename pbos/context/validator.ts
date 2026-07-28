import path from "node:path";
import {
  Artifacts,
  PBOSConfig,
  artifactDigest,
} from "../kernel";
import {
  DEFAULT_CONTEXT_MAX_AGE_MS,
  REPOSITORY_CONTEXT_VERSION,
  type ContextValidationResult,
  type RepositoryContextArtifact,
  type RepositoryContextSnapshot,
} from "./schema";

function normalizeRemoteUrl(value: string): string {
  return value
    .replace(/^git@github\.com:/, "https://github.com/")
    .replace(/\/+$/, "")
    .replace(/\.git$/, "")
    .toLowerCase();
}

export function validateRepositoryContext(options: {
  artifact: RepositoryContextArtifact | undefined;
  observed: RepositoryContextSnapshot;
  expectedRoot?: string;
  now?: Date;
  maxAgeMs?: number;
}): ContextValidationResult {
  const errors: string[] = [];
  const {
    artifact,
    observed,
  } = options;

  if (!artifact) {
    return {
      valid: false,
      errors: ["Context validation failed: context artifact is missing."],
    };
  }

  if (artifact.version !== REPOSITORY_CONTEXT_VERSION) {
    errors.push(
      "Context validation failed: context schema version is unsupported."
    );
  }

  if (artifact.identity !== artifactDigest(artifact.snapshot)) {
    errors.push(
      "Context validation failed: context artifact identity is invalid."
    );
  }

  const capturedAt = Date.parse(artifact.capturedAt);
  const now = (options.now ?? new Date()).getTime();
  const maxAgeMs =
    options.maxAgeMs ?? DEFAULT_CONTEXT_MAX_AGE_MS;

  if (
    !Number.isFinite(capturedAt) ||
    capturedAt > now ||
    now - capturedAt > maxAgeMs
  ) {
    errors.push(
      "Context validation failed: context artifact is stale."
    );
  }

  const expectedRoot = path.resolve(
    options.expectedRoot ?? process.cwd()
  );
  if (
    path.resolve(observed.repositoryRoot) !== expectedRoot ||
    path.resolve(artifact.snapshot.repositoryRoot) !== expectedRoot
  ) {
    errors.push(
      "Context validation failed: repository root does not match expected context."
    );
  }

  if (
    observed.repositoryIdentity !== "playbook-platform" ||
    artifact.snapshot.repositoryIdentity !== observed.repositoryIdentity
  ) {
    errors.push(
      "Context validation failed: repository identity is unknown."
    );
  }

  if (
    artifact.snapshot.remoteName !== PBOSConfig.repository.remote ||
    observed.remoteName !== PBOSConfig.repository.remote ||
    normalizeRemoteUrl(observed.remoteUrl) !==
      normalizeRemoteUrl(PBOSConfig.repository.url) ||
    normalizeRemoteUrl(artifact.snapshot.remoteUrl) !==
      normalizeRemoteUrl(observed.remoteUrl)
  ) {
    errors.push(
      "Context validation failed: configured repository remote does not match."
    );
  }

  if (
    artifact.snapshot.git.branch !== observed.git.branch ||
    artifact.snapshot.git.upstream !== observed.git.upstream ||
    observed.git.upstream !==
      `${PBOSConfig.repository.remote}/${observed.git.branch}` ||
    observed.git.behind !== 0
  ) {
    errors.push(
      "Context validation failed: branch does not match expected context."
    );
  }

  if (artifact.snapshot.git.commitSha !== observed.git.commitSha) {
    errors.push(
      "Context validation failed: commit identity mismatches."
    );
  }

  if (
    artifact.snapshot.git.workingTreeClean !==
      observed.git.workingTreeClean ||
    artifact.snapshot.git.workingTreeDigest !==
      observed.git.workingTreeDigest
  ) {
    errors.push(
      "Context validation failed: working tree state changed after capture."
    );
  }

  if (
    artifact.snapshot.runtime.engineVersion !==
      observed.runtime.engineVersion ||
    observed.runtime.engineVersion !== PBOSConfig.engineVersion ||
    artifact.snapshot.runtime.currentGate !==
      observed.runtime.currentGate ||
    artifact.snapshot.runtime.activeSprint !==
      observed.runtime.activeSprint ||
    artifact.snapshot.runtime.executionMode !==
      observed.runtime.executionMode ||
    artifact.snapshot.runtime.completedGates.join("|") !==
      observed.runtime.completedGates.join("|")
  ) {
    errors.push(
      "Context validation failed: PBOS runtime context changed after capture."
    );
  }

  if (
    observed.runtime.currentGate !== observed.runtime.activeSprint
  ) {
    errors.push(
      "Context validation failed: current gate and active sprint conflict."
    );
  }

  const capturedArtifacts = new Map(
    artifact.snapshot.artifacts.map((item) => [item.path, item])
  );
  for (const current of observed.artifacts) {
    const captured = capturedArtifacts.get(current.path);

    if (!current.exists || !captured?.exists) {
      errors.push(
        `Context validation failed: required artifact missing: ${current.path}.`
      );
      continue;
    }

    if (captured.digest !== current.digest) {
      errors.push(
        `Context validation failed: artifact changed after capture: ${current.path}.`
      );
    }

    if (
      current.path === Artifacts.repository &&
      current.branch !== observed.git.branch
    ) {
      errors.push(
        "Context validation failed: repository artifact branch conflicts with Git."
      );
    }

    if (
      current.path === Artifacts.validation &&
      current.status !== "PASS"
    ) {
      errors.push(
        "Context validation failed: runtime validation artifact is not PASS."
      );
    }

    if (current.generatedAt) {
      const generatedAt = Date.parse(current.generatedAt);
      if (
        !Number.isFinite(generatedAt) ||
        generatedAt > now ||
        now - generatedAt > maxAgeMs
      ) {
        errors.push(
          `Context validation failed: required artifact is stale: ${current.path}.`
        );
      }
    }
  }

  const gateArtifactPaths = new Set<string>([
      Artifacts.planning,
      Artifacts.validation,
      Artifacts.execution,
      Artifacts.executionContract,
      Artifacts.workPackage,
      Artifacts.executionAuthorization,
  ]);
  const gateArtifacts = observed.artifacts.filter((item) =>
    gateArtifactPaths.has(item.path)
  );
  const permittedGates = new Set([
    observed.runtime.currentGate,
    ...observed.runtime.completedGates,
  ]);

  for (const item of gateArtifacts) {
    if (item.gateId && !permittedGates.has(item.gateId)) {
      errors.push(
        `Context validation failed: artifact ${item.path} references conflicting gate ${item.gateId}.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
