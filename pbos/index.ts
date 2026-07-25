import { runRepositoryAnalysis } from "./commands/repository";
// import { runPlanner } from "./commands/planner";
// import { runValidator } from "./commands/validator";
import { runPlanner } from "./commands/planner";
import { runPBOS } from "./commands/run";
import { runValidator } from "./commands/validator";

const command = process.argv[2] ?? "run";

switch (command) {
  case "repository":
    runRepositoryAnalysis();
    break;

  case "planner":
  runPlanner();
  break;

  case "validate":
    console.log("Validation command coming soon.");
    break;

  case "status":
    console.log("Status command coming soon.");
    break;

  // "next" becomes an alias for "run"
  case "run":
case "next":
  runPBOS();
  break;

  case "validator":
    runValidator();
    break;

  default:
    console.log("");
    console.log("PBOS");
    console.log("====");
    console.log("");
    console.log("Usage:");
    console.log("  npx tsx pbos/index.ts repository");
    console.log("  npx tsx pbos/index.ts planner");
    console.log("  npx tsx pbos/index.ts validate");
    console.log("  npx tsx pbos/index.ts status");
    console.log("  npx tsx pbos/index.ts run");
    console.log("");
}