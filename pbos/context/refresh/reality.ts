import { artifactDigest } from "../../kernel/identity";
import type { RepositoryContextSnapshot } from "../schema";
import type { ContextValidationResult } from "../schema";
import type {
  ContextRealitySnapshot,
} from "./types";

export function buildContextRealitySnapshot(input: {
  readonly repository: RepositoryContextSnapshot;
  readonly architecture_inventory: readonly string[];
  readonly governance_state: string;
  readonly captured_at: string;
}): ContextRealitySnapshot {
  const body: ContextRealitySnapshot = {
    id: `CONTEXT-REALITY-${artifactDigest(input.repository).slice(0, 16)}`,
    repository_identity: input.repository.repositoryIdentity,
    commit_identity: input.repository.git.commitSha,
    branch: input.repository.git.branch,
    working_tree_clean: input.repository.git.workingTreeClean,
    working_tree_content_digest:
      input.repository.git.workingTreeContentDigest,
    artifact_inventory: [...input.repository.artifacts].sort((a, b) =>
      a.path.localeCompare(b.path)
    ),
    architecture_inventory: [...input.architecture_inventory].sort(),
    runtime_inventory: input.repository.runtime,
    governance_state: input.governance_state,
    captured_at: input.captured_at,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}

export function validateContextReality(
  value: ContextRealitySnapshot,
  expected: {
    readonly repository_identity: string;
    readonly commit_identity: string;
    readonly branch: string;
  }
): ContextValidationResult {
  const findings = [
    ...(value.repository_identity !== expected.repository_identity
      ? ["Repository identity mismatches."]
      : []),
    ...(value.commit_identity !== expected.commit_identity
      ? ["Commit identity mismatches."]
      : []),
    ...(value.branch !== expected.branch ? ["Branch identity mismatches."] : []),
    ...(!value.working_tree_clean ? ["Working tree is not committed."] : []),
    ...(value.artifact_inventory.length === 0 ||
    value.artifact_inventory.some(({ exists }) => !exists)
      ? ["Artifact inventory is incomplete."]
      : []),
    ...(value.architecture_inventory.length === 0
      ? ["Architecture inventory is incomplete."]
      : []),
    ...(!value.governance_state ? ["Governance state is missing."] : []),
    ...(artifactDigest({ ...value, digest: undefined }) !== value.digest
      ? ["Context reality digest is corrupted."]
      : []),
  ];
  return { valid: findings.length === 0, errors: findings };
}
