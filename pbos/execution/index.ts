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
import path from "node:path";
import {
  decodeCodexWorkPackage,
  decodeExecutionContract,
} from "../runtime/artifact-decoders";

export function evaluateExecutionEligibility(
  rootDir = process.cwd()
): ExecutionPlan {
  const context = loadExecutionContext(rootDir);

  const plan = createExecutionPlan(context);

  if (
    plan.status === "READY" &&
    plan.gate !== "NONE" &&
    context.planning.selectedGate
  ) {
    const existingAuthorization =
      loadExecutionAuthorizationOrUndefined(rootDir);

    let contract: ExecutionContract;
    let workPackage: CodexWorkPackage;

    if (existingAuthorization) {
      if (
        !Runtime.exists(path.join(rootDir, Artifacts.executionContract)) ||
        !Runtime.exists(path.join(rootDir, Artifacts.workPackage))
      ) {
        return {
          status: "BLOCKED",
          gate: plan.gate,
          tasks: [],
        };
      }

      contract = decodeExecutionContract(
        Runtime.load(path.join(rootDir, Artifacts.executionContract))
      );
      workPackage = decodeCodexWorkPackage(
        Runtime.load(path.join(rootDir, Artifacts.workPackage))
      );
    } else {
      contract = generateExecutionContract(
        context.planning.selectedGate,
        rootDir
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
        contract,
        rootDir
      );

      generateExecutionAuthorization(
        contract,
        workPackage,
        rootDir
      );
    }

    const authorization = loadExecutionAuthorizationOrUndefined(rootDir);

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

  return eligiblePlan;
}

export function runExecutionEngine(
  dispatch: ExecutionDispatcher = dispatchExecutionAdapter,
  rootDir = process.cwd()
): ExecutionPlan {
  const eligiblePlan = evaluateExecutionEligibility(rootDir);
  return eligiblePlan.status === "READY"
    ? dispatch(eligiblePlan)
    : eligiblePlan;
}

export type { ExecutionDispatcher } from "./dispatch";
export * from "./capability-binding-adapter";
