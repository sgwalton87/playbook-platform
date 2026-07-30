export type { CodexExecutionPackage } from "../prompt-generator";

export interface ExecutionPackageValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}
