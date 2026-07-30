import type { BuildMilestoneState } from "../manifests";

export interface ManifestTransitionRequest {
  readonly request_id: string;
  readonly milestone_id: string;
  readonly from: BuildMilestoneState;
  readonly to: BuildMilestoneState;
  readonly manifest_digest: string;
  readonly context_digest: string;
  readonly package_digest: string;
  readonly authorization_id: string;
  readonly execution_id: string;
  readonly validation_evidence: readonly string[];
  readonly completion_evidence: readonly string[];
  readonly requested_by: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface ManifestTransitionDecision {
  readonly request_id: string;
  readonly approved: boolean;
  readonly authority: "PBOS-MILESTONE-ADVANCEMENT";
  readonly findings: readonly string[];
  readonly transition_digest: string | null;
  readonly timestamp: string;
  readonly digest: string;
}
