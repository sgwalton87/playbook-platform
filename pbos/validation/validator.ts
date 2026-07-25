import type {
  ReleaseContract,
  ValidationAdapter,
} from "../release/contracts";

import { buildReleaseContract } from "../release/build-contract";
import type { ValidationPlan } from "./planner";
import { createValidationPlanner } from "./planner";

export interface ValidationExecutionOptions {
  version?: string;
  gateId?: string | null;
  persist?: boolean;
  reportsDirectory?: string;
}

export interface ValidationExecutionResult {
  contract: ReleaseContract;
  adapters: ValidationAdapter[];
}

export class ValidationKernel {
  private readonly plan: ValidationPlan;

  constructor(plan: ValidationPlan) {
    this.plan = plan;
  }

  public adapters(): ValidationAdapter[] {
    return createValidationPlanner(this.plan).createAdapters();
  }

  public async execute(
    options: ValidationExecutionOptions = {}
  ): Promise<ValidationExecutionResult> {
    const adapters = this.adapters();

    const contract = await buildReleaseContract({
      version: options.version,
      gateId: options.gateId,
      adapters,
      persist: options.persist,
      reportsDirectory: options.reportsDirectory,
    });

    return {
      contract,
      adapters,
    };
  }
}

export async function validate(
  plan: ValidationPlan,
  options: ValidationExecutionOptions = {}
): Promise<ReleaseContract> {
  const kernel = new ValidationKernel(plan);

  const result = await kernel.execute(options);

  return result.contract;
}

export async function validateAdapters(
  adapters: ValidationAdapter[],
  options: ValidationExecutionOptions = {}
): Promise<ReleaseContract> {
  return buildReleaseContract({
    version: options.version,
    gateId: options.gateId,
    adapters,
    persist: options.persist,
    reportsDirectory: options.reportsDirectory,
  });
}
