import type { ExecutionPlan } from "../execution/types";
import { WorkflowModel } from "./types";

export function buildWorkflow(
  execution: ExecutionPlan
): WorkflowModel {

  return {

    workflowId: execution.gate,

    status: "READY",

    steps: execution.tasks.map(
      (
        task: string,
        index: number
      ) => ({

        id: `STEP-${index + 1}`,

        engine: "pbos",

        description: task,

        status: "PENDING",

        dependsOn:
          index === 0
            ? []
            : [`STEP-${index}`],

      })
    ),

  };

}