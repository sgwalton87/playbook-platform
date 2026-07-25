import { writeFileSync } from "node:fs";
import { loadGates } from "../planner/load";
import { analyzeGates } from "../planner/analyze";

export function runPlanner() {
  const gates = loadGates();
  const analysis = analyzeGates(gates);

  const selected = analysis.eligible.sort(
    (a, b) => b.priority - a.priority
  )[0];

  const output = {
    selectedGate: selected ?? null,
    eligible: analysis.eligible.map(g => g.id),
    blocked: analysis.blocked.map(g => g.id),
  };

  writeFileSync(
    "pbos/runtime/next-gate.json",
    JSON.stringify(output, null, 2)
  );

  console.log("");
  console.log("PBOS Planning Engine");
  console.log("--------------------");

  if (selected) {
    console.log(`Selected Gate : ${selected.id}`);
    console.log(`Title         : ${selected.title}`);
    console.log(`Priority      : ${selected.priority}`);
  } else {
    console.log("No eligible gate found.");
  }

  console.log("");
  console.log(`Eligible : ${analysis.eligible.length}`);
  console.log(`Blocked  : ${analysis.blocked.length}`);

  console.log("");
  console.log("Planning model written to:");
  console.log("pbos/runtime/next-gate.json");
}