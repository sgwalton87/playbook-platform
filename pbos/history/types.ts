export interface EngineRunRecord {
  id: string;
  name: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  status: "PASS" | "FAIL";
}

export interface ExecutionHistory {
  runId: string;
  startedAt: string;
  finishedAt: string;
  totalDurationMs: number;
  engines: EngineRunRecord[];
}
