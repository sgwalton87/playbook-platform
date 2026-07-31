import type { ApprovalRecord } from "../../authority";
import type { TrustedBuildContext } from "../../context/activation";
import type { CodexExecutionPackage } from "../../orchestration";
import type { ExecutionAdmissionEvidence } from "../admission";
import type {
  ExecutionAuthorization,
  ExecutionAuthorityRecord,
} from "../authority";
import type { ExecutionEvidenceBundle } from "../evidence";
import type { ExecutionProviderRegistry } from "../providers";
import type { TaskAssignment } from "../tasks";

export interface ExecutionFabricRequest {
  readonly context: TrustedBuildContext;
  readonly package: CodexExecutionPackage;
  readonly approval: ApprovalRecord;
  readonly authority: ExecutionAuthorityRecord;
  readonly authorization: ExecutionAuthorization;
  readonly assignment: TaskAssignment;
  readonly admission: ExecutionAdmissionEvidence;
  readonly providers: ExecutionProviderRegistry;
  readonly requested_at: string;
}

export interface ExecutionFabricResult {
  readonly provider_id: string;
  readonly evidence: ExecutionEvidenceBundle;
  readonly advancement_eligible: boolean;
  readonly digest: string;
}
