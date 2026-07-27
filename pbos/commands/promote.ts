#!/usr/bin/env tsx

import { promoteGate } from "../release/promote";

async function main() {
  console.log("");
  console.log("===================================");
  console.log("PBOS PROMOTION");
  console.log("===================================");
  console.log("");

  const result = await promoteGate();

  console.log(`Gate: ${result.gateId}`);
  console.log(`Promoted: ${result.promoted ? "YES" : "NO"}`);
  console.log(`Reason: ${result.reason}`);
  console.log(`Timestamp: ${result.timestamp}`);

  console.log("");

  if (!result.promoted) {
    process.exit(1);
  }

  console.log("Promotion artifact generated.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
