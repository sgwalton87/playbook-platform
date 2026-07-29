#!/usr/bin/env tsx

import path from "node:path";
import fs from "node:fs";
import { transitionGate } from "../lifecycle";
import { Artifacts, Runtime } from "../kernel";

async function main() {

  console.log("");
  console.log("===================================");
  console.log("PBOS GATE ACTIVATION");
  console.log("===================================");
  console.log("");

  const root = process.cwd();

  const gateId = process.argv[2];

  if (!gateId) {
    throw new Error(
      "Usage: npm run pbos:activate -- PBOS-UI-001"
    );
  }

  const gatePath = path.join(
    root,
    "pbos/gates",
    `${gateId}.json`
  );


  if (!fs.existsSync(gatePath)) {
    throw new Error(
      `Gate file not found: ${gatePath}`
    );
  }


  const gate = JSON.parse(
    fs.readFileSync(
      gatePath,
      "utf8"
    )
  );


  const completedDependencies =
    gate.dependencies.every(
      (dependency: string) => {
        const dependencyPath = path.join(
          root,
          "pbos/gates",
          `${dependency}.json`
        );

        if (!fs.existsSync(dependencyPath)) {
          return false;
        }

        const dependencyGate = JSON.parse(
          fs.readFileSync(
            dependencyPath,
            "utf8"
          )
        );

        return dependencyGate.status === "complete";
      }
    );


  if (!completedDependencies) {
    throw new Error(
      "Activation denied: dependencies are not complete."
    );
  }


  const result = transitionGate({
    gatePath,
    gateId,
    nextStatus: "in_progress",
    reason:
      "Gate activated after dependency completion review.",
    evidence: [
      ...gate.dependencies.map(
        (dependency: string) =>
          `pbos/gates/${dependency}.json`
      )
    ],
  });


  const artifactPath = path.join(
    root,
    Artifacts.activation
  );


  Runtime.save(
    artifactPath,
    result,
    "gate-lifecycle"
  );


  console.log(`Gate: ${result.gateId}`);
  console.log(`Transition: ${result.from} → ${result.to}`);
  console.log(`Reason: ${result.reason}`);
  console.log("");
  console.log("Activation artifact generated.");

}


main().catch((error) => {
  console.error(error);
  process.exit(1);
});
