import { observe } from "./observe";
import { reason } from "./reason";

import { Logger } from "../kernel";

import { OrchestrationResult } from "./types";

export function orchestrate(): OrchestrationResult {

  Logger.section("PBOS Orchestrator");

  Logger.info("Observe");
  const observation = observe();

  Logger.info("Reason");
  const reasoning = reason(observation);

  Logger.blank();

  Logger.keyValue(
    "Objective",
    reasoning.decision.winner.title
  );

  Logger.keyValue(
    "Priority",
    reasoning.decision.winner.score
  );

  Logger.blank();

  Logger.info("Reasons");

  for (const reason of reasoning.decision.winner.reasons) {
    Logger.info(`  • ${reason}`);
  }

  return {
    startedAt: observation.startedAt,
    finishedAt: new Date().toISOString(),
    success: true,
    world: observation.world,
    decision: reasoning.decision,
  };

}