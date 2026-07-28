#!/usr/bin/env tsx

import { completePromotedGate } from "../lifecycle";

async function main() {

  console.log("");
  console.log("===================================");
  console.log("PBOS GATE COMPLETION");
  console.log("===================================");
  console.log("");

  const requestedGateId = process.argv[2];
  const result = await completePromotedGate({
    requestedGateId,
  });


  console.log(`Gate: ${result.gateId}`);
  console.log(`Transition: ${result.from} → ${result.to}`);
  console.log(`Reason: ${result.reason}`);
  console.log("");
  console.log("Planning artifact refreshed.");
  console.log("Completion artifact generated.");

}


main().catch((error) => {
  console.error(error);
  process.exit(1);
});
