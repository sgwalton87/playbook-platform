import { loadExecutionContext } from "./load";
import { createExecutionPlan } from "./plan";
import {
  generateExecutionContract,
  validateExecutionContract,
} from "./contracts";
import {
  generateCodexWorkPackage,
} from "./work-package";
import {
  generateExecutionAuthorization,
  loadExecutionAuthorizationOrUndefined,
  validateExecutionAuthorization,
} from "./authorization";
import { Artifacts, Runtime } from "../kernel";
import type { ExecutionContract } from "./contracts";
import type { CodexWorkPackage } from "./work-package";
import {
  dispatchExecutionAdapter,
  type ExecutionDispatcher,
} from "./dispatch";
import type { ExecutionPlan } from "./types";

export function runExecutionEngine(
  dispatch: ExecutionDispatcher = dispatchExecutionAdapter
): ExecutionPlan {
  const context = loadExecutionContext();

  const plan = createExecutionPlan(context);

  if (
    plan.status === "READY" &&
    plan.gate !== "NONE" &&
    context.planning.selectedGate
  ) {
    const existingAuthorization =
      loadExecutionAuthorizationOrUndefined();

    let contract: ExecutionContract;
    let workPackage: CodexWorkPackage;

    if (existingAuthorization) {
      if (
        !Runtime.exists(Artifacts.executionContract) ||
        !Runtime.exists(Artifacts.workPackage)
      ) {
        return {
          status: "BLOCKED",
          gate: plan.gate,
          tasks: [],
        };
      }

      contract = Runtime.load<ExecutionContract>(
        Artifacts.executionContract
      );
      workPackage = Runtime.load<CodexWorkPackage>(
        Artifacts.workPackage
      );
    } else {
      contract = generateExecutionContract(
        context.planning.selectedGate
      );

      const contractValidation = validateExecutionContract(
        contract
      );

      if (!contractValidation.passed) {
        return {
          status: "BLOCKED",
          gate: plan.gate,
          tasks: [],
        };
      }

      workPackage = generateCodexWorkPackage(
        contract
      );

      generateExecutionAuthorization(
        contract,
        workPackage
      );
    }

    const authorization = loadExecutionAuthorizationOrUndefined();

    const authorizationValidation = validateExecutionAuthorization(
      authorization,
      contract,
      workPackage
    );

    if (!authorizationValidation.valid) {
      return {
        status: "BLOCKED",
        gate: plan.gate,
        tasks: [],
      };
    }
  }

  const eligiblePlan: ExecutionPlan = {
    status: plan.status,
    gate: plan.gate,
    tasks: plan.tasks,
  };

  return eligiblePlan.status === "READY"
    ? dispatch(eligiblePlan)
    : eligiblePlan;
}

export type { ExecutionDispatcher } from "./dispatch";
