import type { AutonomousRiskDecision } from "../risk-router";

export type FounderReadinessState = "READY" | "NOT_READY" | "BLOCKED";

export interface MissionAlignmentCheck {
  readonly aligned: boolean;
  readonly mission: "Advance the Playbook Platform through governed development";
  readonly findings: readonly string[];
  readonly evidence: readonly string[];
  readonly digest: string;
}

export interface PBOSReadinessGuidance {
  readonly current_blocker: string;
  readonly business_impact: string;
  readonly why: string;
  readonly required_resolution: readonly string[];
  readonly responsible_authority: string;
  readonly commands: readonly string[];
  readonly expected_next_state: string;
}

export interface EnterpriseMissionControlSnapshot {
  readonly current_mission: string;
  readonly current_state: FounderReadinessState;
  readonly current_blockers: readonly string[];
  readonly current_authority: string;
  readonly current_execution: string;
  readonly current_outcome: string;
  readonly next_action: string;
  readonly launch_status: "GO" | "HOLD" | "ABORT";
  readonly authority_state: "ACTIVE" | "MISSING" | "INVALID";
  readonly execution_state: "NOT_STARTED" | "ADMITTED" | "EXECUTING" | "COMPLETE" | "FAILED";
  readonly evidence_state: "NOT_AVAILABLE" | "PENDING" | "CAPTURED" | "INVALID";
  readonly change_boundary_status: "APPROVED" | "MISSING" | "INVALID";
  readonly boundary_type: "CHANGE" | "BASELINE_ACTIVATION" | "NONE";
  readonly launch_approval_status: "APPROVED" | "REJECTED" | "MISSING" | "INVALID";
  readonly context_status: "TRUSTED" | "MISSING" | "INVALID";
  readonly digest: string;
}

export interface PBOSLaunchReadinessAssessment {
  readonly assessment_id: string;
  readonly launch_status: "GO" | "HOLD" | "ABORT";
  readonly system_status: string;
  readonly current_blockers: readonly string[];
  readonly business_impact: string;
  readonly technical_explanation: string;
  readonly responsible_authority: string;
  readonly required_remediation: readonly string[];
  readonly expected_resolution_state: string;
  readonly timestamp: string;
  readonly digest: string;
}

export interface FounderOperatingLoopResult {
  readonly loop_id: string;
  readonly readiness: FounderReadinessState;
  readonly phases_completed: readonly string[];
  readonly mission_alignment: MissionAlignmentCheck;
  readonly next_play: string | null;
  readonly risk: AutonomousRiskDecision | null;
  readonly guidance: PBOSReadinessGuidance | null;
  readonly mission_control: EnterpriseMissionControlSnapshot;
  readonly launch_readiness: PBOSLaunchReadinessAssessment;
  readonly outcome:
    | "STOPPED_SAFELY"
    | "AWAITING_AUTHORITY"
    | "READY_FOR_GOVERNED_ACTION";
  readonly mutation: "NOT_PERFORMED";
  readonly evidence: readonly string[];
  readonly digest: string;
}
