export const AUTONOMOUS_ACTIONS = [
  "GATHER_EVIDENCE",
  "ANALYZE_STATE",
  "GENERATE_REPORT",
  "IDENTIFY_BLOCKERS",
  "RECOMMEND_NEXT_STEP",
] as const;

export const HUMAN_APPROVAL_ACTIONS = [
  "CHANGE_CONSTITUTION",
  "DECIDE_GOVERNANCE",
  "CHANGE_ARCHITECTURE",
  "AUTHORIZE_EXECUTION",
  "APPROVE_CERTIFICATION",
  "APPROVE_RELEASE",
] as const;

export function actionRequiresHumanApproval(action: string): boolean {
  return (HUMAN_APPROVAL_ACTIONS as readonly string[]).includes(action);
}
