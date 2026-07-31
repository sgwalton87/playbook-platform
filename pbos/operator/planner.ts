import { artifactDigest } from "../kernel/identity";
import type { PBOSRecoveryAssessment } from "../recovery";
import type { OperatorIntent } from "./intent";
import {
  resolveOperatorTransition,
  type OperatorStateDecision,
} from "./state-machine";

export interface OperatorHumanAction {
  readonly reason: string;
  readonly why: string;
  readonly command: string;
  readonly previous_identity: string | null;
  readonly proposed_identity: string;
}

export interface OperatorPlan {
  readonly plan_id: string;
  readonly intent: OperatorIntent;
  readonly assessment_id: string;
  readonly decision: OperatorStateDecision;
  readonly automatic_actions: readonly string[];
  readonly human_action: OperatorHumanAction | null;
  readonly digest: string;
}

export function createOperatorPlan(
  intent: OperatorIntent,
  assessment: PBOSRecoveryAssessment
): OperatorPlan {
  const decision = resolveOperatorTransition(assessment);
  const humanAction = decision.human_authority_required && decision.command
    ? {
        reason: `${decision.command} requires governed human authority.`,
        why: assessment.diagnosis[0] ??
          "Current repository state is not covered by active authority.",
        command: decision.command,
        previous_identity: assessment.context_state.previous_identity,
        proposed_identity: assessment.context_state.proposed_identity,
      }
    : null;
  const body = {
    intent,
    assessment_id: assessment.assessment_id,
    decision,
    automatic_actions: [
      "Repository intelligence inspected",
      "Runtime artifact ownership inspected",
      "Context and authority evidence validated",
      "Safe next transition selected",
    ],
    human_action: humanAction,
  };
  const digest = artifactDigest(body);
  return {
    plan_id: `PBOS-OPERATOR-${digest.slice(0, 16)}`,
    ...body,
    digest,
  };
}
