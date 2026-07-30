import { artifactDigest } from "../../kernel/identity";
import { CodexExecutionPackageEngine } from "../execution-packages";
import type {
  ExecutionEnvironment,
  ExecutionRequest,
  ExecutionResult,
  IsolatedExecutionAdapter,
} from "./types";

export class IsolatedImplementationRunner {
  async run(
    request: ExecutionRequest,
    environment: ExecutionEnvironment,
    adapter: IsolatedExecutionAdapter
  ): Promise<ExecutionResult> {
    const authorization = request.authorization;
    if (
      !environment.isolated ||
      environment.writable_roots.length === 0 ||
      environment.timeout_ms <= 0 ||
      !request.kernel_admission_digest ||
      !request.requested_by ||
      !new CodexExecutionPackageEngine().validate(request.package).valid ||
      !authorization.valid ||
      authorization.decision.decision !== "APPROVED" ||
      authorization.request.package_digest !== request.package.digest ||
      authorization.decision.request_digest !== authorization.request.digest
    ) {
      throw new Error("Isolated execution admission rejected.");
    }
    const result = await adapter.run(request, environment);
    if (
      result.request_id !== request.id ||
      result.environment_id !== environment.id ||
      result.artifacts.some(({ path }) =>
        environment.prohibited_paths.some(
          (prohibited) => path === prohibited || path.startsWith(`${prohibited}/`)
        )
      )
    ) {
      throw new Error("Isolated execution result violated its boundary.");
    }
    return { ...result, digest: artifactDigest(result) };
  }
}
