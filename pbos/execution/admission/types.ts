import type { AgentRecord } from "../../agents/registry";
import type { ApprovalRecord } from "../../authority";
import type { TrustedBuildContext } from "../../context/activation";
import type { CodexExecutionPackage } from "../../orchestration/execution-packages";
import type { TaskAssignment } from "../tasks";
import type { ExecutionAuthorityRecord } from "../authority";
import type { ExecutionIdentityResolution } from "../providers";

export interface ExecutionAdmissionRequest {
  readonly request_id: string;
  readonly context: TrustedBuildContext | null;
  readonly package: CodexExecutionPackage | null;
  readonly package_certification_digest: string | null;
  readonly execution_authority: ExecutionAuthorityRecord | null;
  readonly approval: ApprovalRecord | null;
  readonly agent: AgentRecord | null;
  readonly identity_resolution: ExecutionIdentityResolution | null;
  readonly assignment: TaskAssignment | null;
  readonly requested_at: string;
  readonly digest: string;
}

export interface ExecutionAdmissionDecision {
  readonly request_id: string;
  readonly admitted: boolean;
  readonly authority: "PBOS-AGENT-EXECUTION-ADMISSION";
  readonly findings: readonly string[];
  readonly decided_at: string;
  readonly digest: string;
}

export interface ExecutionAdmissionEvidence {
  readonly request_digest: string;
  readonly context_digest: string | null;
  readonly package_digest: string | null;
  readonly approval_digest: string | null;
  readonly agent_digest: string | null;
  readonly identity_resolution_digest: string | null;
  readonly assignment_digest: string | null;
  readonly certification_digest: string | null;
  readonly execution_authority_digest: string | null;
  readonly decision: ExecutionAdmissionDecision;
  readonly digest: string;
}
