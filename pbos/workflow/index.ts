import { loadExecutionModel } from "./load";
import { buildWorkflow } from "./planner";

export function runWorkflowEngine() {

  const execution =
    loadExecutionModel();

  return buildWorkflow(execution);

}
