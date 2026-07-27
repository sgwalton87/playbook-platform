export type GateStatus =
  | "proposed"
  | "in_progress"
  | "complete"
  | "blocked";

export interface GateTransition {
  gateId: string;
  from: GateStatus;
  to: GateStatus;
  reason: string;
  evidence: string[];
  timestamp: string;
}

export interface TransitionRequest {
  gatePath: string;
  gateId: string;
  nextStatus: GateStatus;
  reason: string;
  evidence: string[];
}
