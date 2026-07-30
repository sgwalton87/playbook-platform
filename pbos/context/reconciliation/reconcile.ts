import { artifactDigest } from "../../kernel/identity";
import type {
  RepositoryContextArtifact,
  RepositoryContextSnapshot,
} from "../schema";
import type {
  ContextDifference,
  ContextReconciliationReport,
} from "./types";

function snapshotIdentity(snapshot: RepositoryContextSnapshot): string {
  return artifactDigest(snapshot);
}

function difference(
  code: ContextDifference["code"],
  previous: unknown,
  current: unknown,
  resolution: string
): ContextDifference | null {
  const before = previous === undefined ? null : JSON.stringify(previous);
  const after = current === undefined ? null : JSON.stringify(current);
  return before === after
    ? null
    : { code, previous: before, current: after, resolution };
}

function compareArtifacts(
  previous: RepositoryContextSnapshot,
  current: RepositoryContextSnapshot
): ContextDifference[] {
  const previousByPath = new Map(
    previous.artifacts.map((artifact) => [artifact.path, artifact])
  );
  const currentByPath = new Map(
    current.artifacts.map((artifact) => [artifact.path, artifact])
  );
  const inventory = difference(
    "ARTIFACT_INVENTORY",
    [...previousByPath.keys()].sort(),
    [...currentByPath.keys()].sort(),
    "Regenerate the repository context through its canonical lifecycle."
  );
  const identities = [...currentByPath.keys()]
    .sort()
    .map((path) =>
      difference(
        "ARTIFACT_IDENTITY",
        previousByPath.get(path),
        currentByPath.get(path),
        `Revalidate '${path}' through its canonical artifact owner.`
      )
    )
    .filter((value): value is ContextDifference => value !== null);
  return [...(inventory ? [inventory] : []), ...identities];
}

export class RepositoryContextReconciliation {
  reconcile(input: {
    readonly stored: RepositoryContextArtifact | undefined;
    readonly current: RepositoryContextSnapshot;
    readonly timestamp: string;
  }): ContextReconciliationReport {
    const previous = input.stored?.snapshot ?? null;
    const currentIdentity = snapshotIdentity(input.current);
    const differences: ContextDifference[] = [];
    if (!previous) {
      differences.push({
        code: "MISSING_CONTEXT",
        previous: null,
        current: currentIdentity,
        resolution: "Create context through the governed context lifecycle.",
      });
    } else {
      const candidates = [
        difference(
          "REPOSITORY_IDENTITY",
          previous.repositoryIdentity,
          input.current.repositoryIdentity,
          "Verify the configured repository identity."
        ),
        difference(
          "REPOSITORY_ROOT",
          previous.repositoryRoot,
          input.current.repositoryRoot,
          "Verify the canonical repository root."
        ),
        difference(
          "REMOTE_IDENTITY",
          [previous.remoteName, previous.remoteUrl],
          [input.current.remoteName, input.current.remoteUrl],
          "Verify the configured remote and repository URL."
        ),
        difference(
          "BRANCH_IDENTITY",
          previous.git.branch,
          input.current.git.branch,
          "Return to the governed branch or authorize a context refresh."
        ),
        difference(
          "COMMIT_IDENTITY",
          previous.git.commitSha,
          input.current.git.commitSha,
          "Reconcile the current HEAD through the context lifecycle."
        ),
        difference(
          "CONTENT_IDENTITY",
          previous.git.workingTreeContentDigest,
          input.current.git.workingTreeContentDigest,
          "Review repository changes before a governed context refresh."
        ),
        difference(
          "RUNTIME_IDENTITY",
          previous.runtime,
          input.current.runtime,
          "Reconcile runtime artifacts through their canonical owners."
        ),
      ].filter((value): value is ContextDifference => value !== null);
      differences.push(...candidates, ...compareArtifacts(previous, input.current));
    }
    const resolutionActions = [
      ...new Set(differences.map(({ resolution }) => resolution)),
    ].sort();
    const state = differences.length === 0 ? "VERIFIED" : "REJECTED";
    const body = {
      reconciliation_id: `CONTEXT-RECONCILIATION-${currentIdentity.slice(0, 16)}`,
      state,
      previous_identity: input.stored?.identity ?? null,
      current_identity: currentIdentity,
      previous_snapshot: previous,
      current_snapshot: input.current,
      differences,
      resolution_actions: resolutionActions,
      confidence: state === "VERIFIED" ? 100 : 0,
      timestamp: input.timestamp,
      digest: "",
    } satisfies ContextReconciliationReport;
    return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
  }
}
