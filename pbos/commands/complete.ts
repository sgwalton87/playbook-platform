#!/usr/bin/env tsx

import path from "node:path";
import { transitionGate } from "../lifecycle";
import { refreshPlanningArtifact } from "../engine/planning-refresh";
import fs from "node:fs";

async function main() {

  console.log("");
  console.log("===================================");
  console.log("PBOS GATE COMPLETION");
  console.log("===================================");
  console.log("");

  const root = process.cwd();

  const promotionPath = path.join(
    root,
    "pbos/runtime/promotion.json"
  );

  if (!fs.existsSync(promotionPath)) {
    throw new Error(
      "Completion denied: promotion artifact missing."
    );
  }

  const promotion = JSON.parse(
    fs.readFileSync(
      promotionPath,
      "utf8"
    )
  );

  if (!promotion.promoted) {
    throw new Error(
      "Completion denied: gate was not promoted."
    );
  }


  const requestedGateId = process.argv[2];

  const gateId = requestedGateId || promotion.gateId;

  const gatePath = path.join(
    root,
    "pbos/gates",
    `${gateId}.json`
  );


  const result = transitionGate({
    gatePath,
    gateId,
    nextStatus: "complete",
    reason:
      "Gate completed after successful PBOS release validation and promotion.",
    evidence: [
      "docs/release-evidence/release-contract.json",
      "pbos/runtime/promotion.json"
    ],
  });


  const completionPath = path.join(
    root,
    "pbos/runtime/completion.json"
  );


  fs.writeFileSync(
    completionPath,
    JSON.stringify(
      result,
      null,
      2
    ) + "\n"
  );


  console.log(`Gate: ${result.gateId}`);
  console.log(`Transition: ${result.from} → ${result.to}`);
  console.log(`Reason: ${result.reason}`);
  console.log("");
  await refreshPlanningArtifact(root);

  console.log("Planning artifact refreshed.");
  console.log("Completion artifact generated.");

}


main().catch((error) => {
  console.error(error);
  process.exit(1);
});
