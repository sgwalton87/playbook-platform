import {
  runWorkflowEngine,
} from "../workflow";

import {
  Artifacts,
  Logger,
  Results,
  Runtime,
} from "../kernel";

export function runWorkflow() {

  Logger.blank();
  Logger.section("PBOS Workflow Engine");

  const workflow =
    runWorkflowEngine();

  Logger.blank();

  Logger.keyValue(
    "Workflow",
    workflow.workflowId
  );

  Logger.keyValue(
    "Status",
    workflow.status
  );

  Logger.keyValue(
    "Steps",
    workflow.steps.length
  );

  Runtime.save(
    Artifacts.workflow,
    workflow
  );

  Logger.blank();

  Logger.info(
    "Runtime model written:"
  );

  Logger.info(
    Artifacts.workflow
  );

  return Results.success(
    "workflow",
    workflow,
    Artifacts.workflow,
    "Workflow generated."
  );
}
