import { writeFileSync } from "node:fs";
import { runExecutionEngine } from "../execution";

export function runExecute() {
  console.log("");
  console.log("PBOS Execution Engine");
  console.log("---------------------");

  const execution = runExecutionEngine();

  console.log("");
  console.log(
    `Execution Status.... ${execution.status}`
  );

  console.log(
    `Selected Gate....... ${execution.gate}`
  );

  console.log(
    `Tasks............... ${execution.tasks.length}`
  );

  writeFileSync(
    "pbos/runtime/execution.json",
    JSON.stringify(execution, null, 2)
  );

  console.log("");
  console.log("Runtime model written:");
  console.log("pbos/runtime/execution.json");
}
