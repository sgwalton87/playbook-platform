import { runRepositoryAnalysis } from "./repository";
import { runPlanner } from "./planner";
import { runValidator } from "./validator";
import { runExecute } from "./execute";

export function runPBOS() {
  console.log("");
  console.log("===================================");
  console.log("PBOS ENGINE v0.1");
  console.log("RUN IT!");
  console.log("===================================");
  console.log("");

  //
  // Engine 1 — Repository Intelligence
  //
  runRepositoryAnalysis();

  console.log("");

  //
  // Engine 2 — Planning
  //
  runPlanner();

  console.log("");

  //
  // Engine 3 — Runtime Validator
  //
  runValidator();

  console.log("");

  //
  // Engine 4 — Execution Engine
  //
  runExecute();

  console.log("");

  console.log("===================================");
  console.log("PBOS RUN COMPLETE");
  console.log("===================================");
}
