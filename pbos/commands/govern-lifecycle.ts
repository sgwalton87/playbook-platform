#!/usr/bin/env tsx

import { governGateLifecycle } from "../lifecycle";

async function main(): Promise<void> {
  const gateId = process.argv[2];
  if (!gateId) {
    throw new Error(
      "Usage: npm run pbos:govern-lifecycle -- <gate-id>"
    );
  }
  const run = await governGateLifecycle(gateId);
  console.log("");
  console.log("PBOS LIFECYCLE GOVERNANCE REPORT");
  console.log("");
  console.log(`Gate: ${run.gateId}`);
  console.log(`Transition: ${run.previousStatus} -> ${run.newStatus}`);
  console.log(`Evidence: ${run.evidenceEvaluation.passed ? "PASS" : "FAIL"}`);
  console.log(`Promotion Eligible: ${run.promotionEligible ? "YES" : "NO"}`);
  console.log(`Completed: ${run.completed ? "YES" : "NO"}`);
  console.log(
    `Recovery: ${
      Object.values(run.recovery).every(Boolean) ? "PASS" : "INCOMPLETE"
    }`
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
