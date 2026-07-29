#!/usr/bin/env tsx

import { reconcileRuntimeArtifacts } from "../reconciliation";

export async function runReconcileArtifacts(
  rootDir = process.cwd()
): Promise<void> {
  const run = await reconcileRuntimeArtifacts(rootDir);
  console.log("");
  console.log("PBOS ARTIFACT RECONCILIATION REPORT");
  console.log("");
  console.log(`Artifact Health: ${run.artifactHealth}`);
  console.log(
    `Artifact Conflicts: ${run.unresolvedConflicts.length}`
  );
  console.log(`Refresh Required: ${run.refreshRequired ? "YES" : "NO"}`);
  console.log(
    `Ready For Context Refresh: ${
      run.readyForContextRefresh ? "YES" : "NO"
    }`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runReconcileArtifacts().catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : String(error)
    );
    process.exitCode = 1;
  });
}
