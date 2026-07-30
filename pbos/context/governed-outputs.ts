import { Artifacts } from "../kernel";

export const GOVERNED_CONTEXT_OUTPUTS: ReadonlySet<string> = new Set([
  Artifacts.repositoryContext,
  Artifacts.contextRefresh,
  "docs/release-evidence/pbos-context-refresh.md",
  "docs/release-evidence/pbos-lifecycle-governance-report.md",
  "docs/release-evidence/pbos-planning-handoff-report.md",
]);

export function isGovernedRuntimeOutput(relativePath: string): boolean {
  const normalized = relativePath.replaceAll("\\", "/");
  return (
    normalized.startsWith("pbos/runtime/") ||
    GOVERNED_CONTEXT_OUTPUTS.has(normalized)
  );
}
