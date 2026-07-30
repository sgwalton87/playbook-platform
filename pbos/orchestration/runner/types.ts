import type { CodexExecutionPackage } from "../execution-packages";
import type { AuthorizationEvidence } from "../authorization";

export interface ExecutionRequest {
  readonly id: string;
  readonly package: CodexExecutionPackage;
  readonly authorization: AuthorizationEvidence;
  readonly kernel_admission_digest: string;
  readonly requested_by: string;
  readonly requested_at: string;
}

export interface ExecutionEnvironment {
  readonly id: string;
  readonly isolated: true;
  readonly network_access: "NONE" | "RESTRICTED";
  readonly writable_roots: readonly string[];
  readonly prohibited_paths: readonly string[];
  readonly timeout_ms: number;
}

export interface ExecutionArtifact {
  readonly id: string;
  readonly path: string;
  readonly before_digest: string | null;
  readonly after_digest: string;
}

export interface ExecutionResult {
  readonly execution_id: string;
  readonly request_id: string;
  readonly environment_id: string;
  readonly status: "SUCCEEDED" | "FAILED" | "ROLLED_BACK";
  readonly artifacts: readonly ExecutionArtifact[];
  readonly validations: readonly string[];
  readonly failures: readonly string[];
  readonly rollback: readonly string[];
  readonly started_at: string;
  readonly completed_at: string;
  readonly digest: string;
}

export interface IsolatedExecutionAdapter {
  run(
    request: ExecutionRequest,
    environment: ExecutionEnvironment
  ): Promise<Omit<ExecutionResult, "digest">>;
}
