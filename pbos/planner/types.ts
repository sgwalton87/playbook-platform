export interface GateDefinition {
  id: string;
  title: string;
  status: string;
  priority: number;
  dependencies: string[];
  handbook_refs: string[];
  tasks: string[];
  definition_of_done: string[];
  validation: string[];
  next_gate: string | null;
}

export interface PlanningDecision {
  selectedGate: GateDefinition | null;
  eligible: GateDefinition[];
  blocked: GateDefinition[];
  reasons: string[];
}