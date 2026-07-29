#!/usr/bin/env tsx
import { runPlanningHandoff } from "../planning/handoff";

try {
  const record = runPlanningHandoff(process.cwd());
  console.log("PBOS PLANNING HANDOFF");
  console.log(`Status: ${record.decision.status}`);
  console.log(
    `Objective: ${record.decision.selectedObjective?.objectiveId ?? "none"}`
  );
  console.log(`Reason: ${record.decision.reason}`);
  console.log(`Context: ${record.lineage.contextIdentity}`);
  console.log("Execution: NOT DISPATCHED");
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
