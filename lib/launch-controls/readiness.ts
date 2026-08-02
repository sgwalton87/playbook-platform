export const LAUNCH_GATES = ["build", "lint", "unit_tests", "browser_e2e", "rls_integration", "accessibility", "monitoring", "analytics", "privacy_review", "rollback"] as const;
export type LaunchGate = (typeof LAUNCH_GATES)[number];
export type GateState = "pass" | "fail" | "blocked" | "unknown";
export type LaunchGateEvidence = { gate: LaunchGate; state: GateState; evidence?: string };
export function evaluateLaunchReadiness(evidence: readonly LaunchGateEvidence[]) {
  const byGate = new Map(evidence.map((item) => [item.gate, item]));
  const gates = LAUNCH_GATES.map((gate) => byGate.get(gate) ?? { gate, state: "unknown" as const });
  return { ready: gates.every((gate) => gate.state === "pass"), gates, blocking: gates.filter((gate) => gate.state !== "pass").map((gate) => gate.gate) };
}
