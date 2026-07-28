#!/usr/bin/env tsx

import { defaultValidationAdapters } from "../validation/default-plan";
import { buildReleaseContract } from "../release/build-contract";
import { loadConfig } from "../engine/config";
import { loadState } from "../engine/state";
import { resolveReleaseGateId } from "../release/target";

async function main() {
  const config = await loadConfig();
  const state = await loadState(
    config,
    "release"
  );
  const gateId = await resolveReleaseGateId({
    requestedGateId: process.argv[2],
    currentGateId: state.currentGate,
  });
  console.log("");
  console.log("===================================");
  console.log("PBOS RELEASE VALIDATION");
  console.log("===================================");
  console.log("");

  const contract = await buildReleaseContract({
    version: "3.0.0",
    gateId,
    adapters: [...defaultValidationAdapters],
    persist: true,
    reportsDirectory: config.reportsDirectory,
  });

  console.log(`Overall Status: ${contract.overallStatus}`);
  console.log(
    `Promotion Ready: ${contract.promotionReady ? "YES" : "NO"}`
  );

  console.log("");

  for (const evidence of contract.evidence) {
    console.log(
      `${evidence.id}: ${evidence.status} — ${evidence.summary}`
    );
  }

  console.log("");
  console.log("Release contract generated.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
