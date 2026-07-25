import { runExecutionEngine } from "../execution";

import {
  Artifacts,
  Logger,
  Results,
  Runtime,
} from "../kernel";

export function runExecute() {
  Logger.blank();
  Logger.section("PBOS Execution Engine");

  const execution = runExecutionEngine();

  Logger.blank();

  Logger.keyValue(
    "Execution Status",
    execution.status
  );

  Logger.keyValue(
    "Selected Gate",
    execution.gate
  );

  Logger.keyValue(
    "Tasks",
    execution.tasks.length
  );

  Runtime.save(
    Artifacts.execution,
    execution
  );

  Logger.blank();

  Logger.info(
    "Runtime model written:"
  );

  Logger.info(
    Artifacts.execution
  );

  return Results.success(
    "execution",
    execution,
    Artifacts.execution,
    "Execution plan generated."
  );
}
