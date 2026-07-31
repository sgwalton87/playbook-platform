import type {
  PBOSRecoveryAssessment,
  PBOSRecoveryTransition,
} from "../recovery";

export type OperatorTransition =
  | "NONE"
  | "CHANGE"
  | "RECONCILE"
  | "REFRESH"
  | "ACTIVATE"
  | "BUILD"
  | "RELEASE";

export interface OperatorStateDecision {
  readonly current_state: string;
  readonly transition: OperatorTransition;
  readonly command: string | null;
  readonly human_authority_required: boolean;
}

const TRANSITIONS: Readonly<Record<
  PBOSRecoveryTransition,
  Omit<OperatorStateDecision, "current_state">
>> = {
  NONE: {
    transition: "NONE",
    command: null,
    human_authority_required: false,
  },
  CHANGE_BOUNDARY_REQUIRED: {
    transition: "CHANGE",
    command: "npm run pbos:change-boundary",
    human_authority_required: true,
  },
  COMMITTED_CONTEXT_RECONCILIATION_REQUIRED: {
    transition: "RECONCILE",
    command: "npm run pbos:approve-refresh",
    human_authority_required: true,
  },
  APPROVE_BOUNDARY_REQUIRED: {
    transition: "CHANGE",
    command: "npm run pbos:approve-boundary",
    human_authority_required: true,
  },
  APPROVE_REFRESH_REQUIRED: {
    transition: "RECONCILE",
    command: "npm run pbos:approve-refresh",
    human_authority_required: true,
  },
  REFRESH_REQUIRED: {
    transition: "REFRESH",
    command: "npm run pbos:refresh",
    human_authority_required: false,
  },
  CONTEXT_ACTIVATION_REQUIRED: {
    transition: "ACTIVATE",
    command: "npm run pbos:context-activate",
    human_authority_required: false,
  },
};

export function resolveOperatorTransition(
  assessment: PBOSRecoveryAssessment
): OperatorStateDecision {
  return {
    current_state: assessment.current_phase,
    ...TRANSITIONS[assessment.recommended_transition],
  };
}
