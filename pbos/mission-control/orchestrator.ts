import { assessMissionOutput, selectedMilestone } from "./assessment";
import { formatMissionHeader, formatMissionOutcome } from "./report";
import {
  formatProductMission,
  generateProductMissionPackages,
  resolveProductMission,
} from "./product-mission";
import type {
  MissionCommandDispatcher,
  MissionControlResult,
} from "./types";

export async function runMissionControl(
  dispatch: MissionCommandDispatcher,
  rootDir = process.cwd()
): Promise<MissionControlResult> {
  const status = await dispatch("status");
  if (!status.successful) {
    const outcome = assessMissionOutput(status.output, false);
    return {
      successful: false,
      outcome,
      output: [formatMissionHeader(), "", status.output, "", formatMissionOutcome(outcome)].join("\n"),
    };
  }

  const planning = await dispatch("next");
  if (!planning.successful) {
    const outcome = assessMissionOutput(planning.output, false);
    return {
      successful: false,
      outcome,
      output: [formatMissionHeader(), "", status.output, "", planning.output, "", formatMissionOutcome(outcome)].join("\n"),
    };
  }

  const selected = selectedMilestone(planning.output);
  generateProductMissionPackages(rootDir, selected);
  const productMission = resolveProductMission(
    rootDir,
    selected
  );
  if (productMission) {
    const outcome = assessMissionOutput(planning.output, productMission.ready);
    return {
      successful: productMission.ready,
      outcome: { ...outcome, milestone: selected },
      output: [
        formatMissionHeader(),
        "",
        "PHASE 1 - SYSTEM ASSESSMENT",
        status.output,
        "",
        "PHASE 2 - MISSION PLANNING",
        planning.output,
        "",
        formatProductMission(productMission),
        "",
        "AUTOMATIC ACTIONS: Architecture validated and governed packages generated.",
        "HUMAN ACTION REQUIRED: Review and approve the Scholar Experience build package.",
        "NEXT STEP: npm run pbos:approve",
      ].join("\n"),
    };
  }

  const execution = await dispatch("run");
  let outcome = assessMissionOutput(execution.output, execution.successful);
  outcome = {
    ...outcome,
    milestone: outcome.milestone ?? selectedMilestone(planning.output),
  };
  let continuation = "";
  if (outcome.advancement === "COMPLETE") {
    const next = await dispatch("next");
    outcome = { ...outcome, next_milestone: selectedMilestone(next.output) };
    continuation = next.output;
  }

  return {
    successful: execution.successful,
    outcome,
    output: [
      formatMissionHeader(),
      "",
      "PHASE 1 - SYSTEM ASSESSMENT",
      status.output,
      "",
      "PHASE 2 - MISSION PLANNING",
      planning.output,
      "",
      "PHASES 3-7 - AUTHORITY, EXECUTION, EVIDENCE, ADVANCEMENT",
      execution.output,
      ...(continuation ? ["", "PHASE 8 - AUTOMATIC CONTINUATION", continuation] : []),
      "",
      formatMissionOutcome(outcome),
    ].join("\n"),
  };
}
