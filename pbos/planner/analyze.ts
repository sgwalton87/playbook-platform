import { GateDefinition } from "./types";

export interface PlannerAnalysis {
  eligible: GateDefinition[];
  blocked: GateDefinition[];
}

export function analyzeGates(gates: GateDefinition[]): PlannerAnalysis {
  const eligible: GateDefinition[] = [];
  const blocked: GateDefinition[] = [];

  for (const gate of gates) {
    switch (gate.status) {
      case "in_progress":
        eligible.push(gate);
        break;

      case "proposed":
        if (gate.dependencies.length === 0) {
          eligible.push(gate);
        } else {
          blocked.push(gate);
        }
        break;

      default:
        blocked.push(gate);
    }
  }

  return {
    eligible,
    blocked,
  };
}