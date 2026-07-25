export interface ExecutionContext {
  repository: any;
  planning: any;
  validation: any;
}

export interface ExecutionPlan {
  status: "READY" | "BLOCKED";
  gate: string;
  tasks: string[];
}
