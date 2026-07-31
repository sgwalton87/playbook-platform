export * from "./executor";
export * from "./capability-audit";
export * from "./intent";
export * from "./planner";
export * from "./report";
export * from "./state-machine";

import {
  buildPBOSRecoveryAssessment,
  collectPBOSRecoveryEvidence,
} from "../recovery";
import { executeSafeOperatorActions } from "./executor";
import { OPERATOR_CAPABILITIES } from "./capability-audit";
import { parseOperatorIntent } from "./intent";
import { createOperatorPlan } from "./planner";
import { formatOperatorReport } from "./report";

export function runOperator(
  rootDir = process.cwd(),
  requestedIntent = "RUN_IT",
  timestamp = new Date().toISOString()
): string {
  const assessment = buildPBOSRecoveryAssessment(
    collectPBOSRecoveryEvidence(rootDir, timestamp),
    timestamp
  );
  const plan = createOperatorPlan(
    parseOperatorIntent(requestedIntent),
    assessment
  );
  return formatOperatorReport(
    executeSafeOperatorActions(plan),
    assessment,
    OPERATOR_CAPABILITIES
  );
}
