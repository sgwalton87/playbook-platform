import { artifactDigest } from "../../kernel/identity";
import type { BuildMilestone } from "../../manifests";
import type { AutonomousRiskDecision } from "./types";

export class AutonomousRiskRouter {
  route(milestone: BuildMilestone): AutonomousRiskDecision {
    const route: AutonomousRiskDecision["route"] =
      milestone.risk_level === "GREEN"
        ? "AUTOMATICALLY_ELIGIBLE"
        : milestone.risk_level === "YELLOW"
          ? "FOUNDER_REVIEW"
          : "MANDATORY_APPROVAL";
    const body = {
      milestone_id: milestone.id,
      risk: milestone.risk_level,
      route,
      authority_required: milestone.approval_level,
      reasons: [
        `Manifest risk classification is ${milestone.risk_level}.`,
        `Manifest approval requirement is ${milestone.approval_level}.`,
        ...(milestone.risk_level === "GREEN"
          ? ["Automatic eligibility remains conditional on context, package, agent, authorization, validation, and evidence."]
          : ["Execution must pause for the required human authority."]),
      ],
    };
    return { ...body, digest: artifactDigest(body) };
  }
}
