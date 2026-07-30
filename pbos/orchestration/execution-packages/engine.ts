import { artifactDigest } from "../../kernel/identity";
import type { CodexExecutionPackage } from "../prompt-generator";
import type { ExecutionPackageValidation } from "./types";

export class CodexExecutionPackageEngine {
  validate(value: CodexExecutionPackage): ExecutionPackageValidation {
    const expected = artifactDigest({ ...value, digest: undefined });
    const errors = [
      ...(!value.package_id ? ["Package identity is missing."] : []),
      ...(!value.mission ? ["Package mission is missing."] : []),
      ...(value.human_approval_required !== true
        ? ["Human approval requirement is missing."]
        : []),
      ...(value.digest !== expected ? ["Package digest is invalid."] : []),
      ...(value.validation_requirements.length === 0
        ? ["Validation requirements are missing."]
        : []),
      ...(value.completion_criteria.length === 0
        ? ["Acceptance criteria are missing."]
        : []),
    ];
    return { valid: errors.length === 0, errors };
  }
}
