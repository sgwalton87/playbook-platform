export const GATE_STATUSES = [
  "proposed",
  "in_progress",
  "blocked",
  "complete",
] as const;

export type GateStatus = (typeof GATE_STATUSES)[number];

export function isGateStatus(value: unknown): value is GateStatus {
  return (
    typeof value === "string" &&
    GATE_STATUSES.includes(value as GateStatus)
  );
}

export function isPlanningEligibleStatus(
  status: unknown
): status is "in_progress" {
  return status === "in_progress";
}
