import { runRepositoryAnalysis } from "./commands/repository";
import { runPlanner } from "./commands/planner";
import { runValidator } from "./commands/validator";
import { runExecute } from "./commands/execute";
import { runWorkflow } from "./commands/workflow";
import { runPBOS } from "./commands/run";
import { runDoctorCommand } from "./commands/doctor";

const command = process.argv[2] ?? "run";

switch (command) {
  case "repository":
    runRepositoryAnalysis();
    break;

  case "planner":
    runPlanner();
    break;

  case "validator":
    runValidator();
    break;

  case "execute":
    runExecute();
    break;

  case "workflow":
    runWorkflow();
    break;

  case "run":
  case "next":
    runPBOS();
    break;

  case "doctor":
  runDoctorCommand();
  break;  

  case "validate":
    console.log("Validation command coming soon.");
    break;

  case "status":
    console.log("Status command coming soon.");
    break;

  default:
    console.log("");
    console.log("PBOS");
    console.log("====");
    console.log("");
    console.log("Usage:");
    console.log("  npx tsx pbos/index.ts repository");
    console.log("  npx tsx pbos/index.ts planner");
    console.log("  npx tsx pbos/index.ts validator");
    console.log("  npx tsx pbos/index.ts execute");
    console.log("  npx tsx pbos/index.ts workflow");
    console.log("  npx tsx pbos/index.ts run");
    console.log("");
}
