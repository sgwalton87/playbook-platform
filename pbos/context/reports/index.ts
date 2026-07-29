import type {
  ContextRefreshArtifact,
  RepositoryContextArtifact,
} from "../schema";

export function renderContextRefreshReport(
  context: RepositoryContextArtifact,
  refresh: ContextRefreshArtifact
): string {
  const record = refresh.latest;
  return `# PBOS Repository Context Refresh Report

## Identity

- Context identity: \`${context.identity}\`
- Previous identity: \`${record.previousContextIdentity ?? "none"}\`
- Repository: ${context.snapshot.repositoryIdentity}
- Root: \`${context.snapshot.repositoryRoot}\`
- Remote: ${context.snapshot.remoteName} (${context.snapshot.remoteUrl})
- Branch: ${context.snapshot.git.branch}
- Commit: \`${context.snapshot.git.commitSha}\`
- Working tree digest: \`${context.snapshot.git.workingTreeContentDigest}\`
- Captured at: ${context.capturedAt}

## Refresh

- Reason: ${record.reason}
- Validator: ${record.validator.id}@${record.validator.version}
- Generation result: ${record.generationResult}
- History entries: ${refresh.history.length}

## Triggering Conditions

${
  record.triggeringConditions.length
    ? record.triggeringConditions
        .map((condition) => `- ${condition}`)
        .join("\n")
    : "- Initial governed context capture."
}

## Runtime Artifact Inventory

| Artifact | Owner | Exists | Digest | Gate |
| --- | --- | --- | --- | --- |
${context.snapshot.artifacts
  .map(
    (artifact) =>
      `| ${artifact.path} | ${artifact.owner ?? "unknown"} | ${
        artifact.exists ? "YES" : "NO"
      } | ${artifact.digest ?? "none"} | ${artifact.gateId ?? "none"} |`
  )
  .join("\n")}

No planning, execution, authorization, certification, or lifecycle transition was bypassed by this refresh.
`;
}
