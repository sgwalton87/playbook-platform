import type { ValidationAdapter } from "../release/contracts";
import {
  createValidationAdapter,
  type ValidationCheck,
} from "./adapter";

export interface ValidationPlanStep {
  id: string;
  name: string;
  description: string;
  check: ValidationCheck;
}

export interface ValidationPlan {
  readonly steps: readonly ValidationPlanStep[];
}

export interface PlannerOptions {
  steps: readonly ValidationPlanStep[];
}

export class ValidationPlanner {
  private readonly steps: readonly ValidationPlanStep[];

  constructor(options: PlannerOptions) {
    if (options.steps.length === 0) {
      throw new Error(
        "Validation planner requires at least one validation step."
      );
    }

    this.steps = [...options.steps];
  }

  public getSteps(): readonly ValidationPlanStep[] {
    return this.steps;
  }

  public getStep(id: string): ValidationPlanStep {
    const step = this.steps.find(
      (candidate) => candidate.id === id
    );

    if (!step) {
      throw new Error(
        `Unknown validation step: ${id}`
      );
    }

    return step;
  }

  public createAdapters(): ValidationAdapter[] {
    return this.steps.map((step) =>
      createValidationAdapter({
        id: step.id,
        name: step.name,
        check: step.check,
      })
    );
  }
}

export function createValidationPlan(
  steps: readonly ValidationPlanStep[]
): ValidationPlan {
  return {
    steps: [...steps],
  };
}

export function createValidationPlanner(
  plan: ValidationPlan
): ValidationPlanner {
  return new ValidationPlanner({
    steps: plan.steps,
  });
}
