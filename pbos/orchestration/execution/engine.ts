import { artifactDigest } from "../../kernel/identity";
import { CodexExecutionPackageEngine } from "../execution-packages";
import type {
  GovernedExecutionEvidence,
  GovernedExecutionInput,
} from "./types";

export class GovernedExecutionEngine {
  async execute(
    input: GovernedExecutionInput,
    executor: () => Promise<Omit<GovernedExecutionEvidence, "digest">>
  ): Promise<GovernedExecutionEvidence> {
    const packageValidation = new CodexExecutionPackageEngine().validate(
      input.execution_package
    );
    const approval = input.authorization.decision;
    const expired =
      approval.expires_at !== null &&
      Date.parse(approval.expires_at) <= Date.now();
    if (
      !input.trusted_context ||
      !packageValidation.valid ||
      !input.authorization.valid ||
      approval.decision !== "APPROVED" ||
      approval.request_digest !== input.authorization.request.digest ||
      input.authorization.request.package_digest !== input.execution_package.digest ||
      expired ||
      !input.dependencies_satisfied ||
      !input.validations_passing
    ) {
      throw new Error("Governed execution rejected.");
    }
    const evidence = await executor();
    if (evidence.failures.length > 0) {
      throw new Error("Governed execution reported preserved failures.");
    }
    return {
      ...evidence,
      digest: artifactDigest(evidence),
    };
  }
}
