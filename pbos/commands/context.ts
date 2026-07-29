#!/usr/bin/env tsx

import { refreshRepositoryContext } from "../context";

export function runContext(
  reason = "Operator-requested repository context synchronization.",
  rootDir = process.cwd()
): void {
  const result = refreshRepositoryContext({ rootDir, reason });
  console.log("");
  console.log("PBOS REPOSITORY CONTEXT REPORT");
  console.log("");
  console.log("Context Health: VALID");
  console.log(`Context Identity: ${result.context.identity}`);
  console.log(
    `Previous Identity: ${
      result.refresh.latest.previousContextIdentity ?? "none"
    }`
  );
  console.log(`Last Refresh: ${result.refresh.latest.timestamp}`);
  console.log("Refresh Required: NO");
  console.log(
    `Triggering Conditions: ${
      result.refresh.latest.triggeringConditions.join("; ") ||
      "Initial governed capture"
    }`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    runContext(process.argv.slice(2).join(" ") || undefined);
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : String(error)
    );
    process.exitCode = 1;
  }
}
