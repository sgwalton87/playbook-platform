import { runRepositoryAnalysis } from "./repository";
import { runPlanner } from "./planner";

export function runPBOS() {
  console.log("");
  console.log("===================================");
  console.log("PBOS ENGINE v0.1");
  console.log("RUN IT!");
  console.log("===================================");
  console.log("");

  // Engine 1
  runRepositoryAnalysis();

  console.log("");

  // Engine 2
  runPlanner();

  console.log("");

  console.log("===================================");
  console.log("PBOS RUN COMPLETE");
  console.log("===================================");
}