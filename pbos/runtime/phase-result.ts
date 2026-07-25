import { EngineResult } from "../engine";

export interface PhaseResult {
  phase: string;
  startedAt: string;
  finishedAt: string;
  engines: {
    id: string;
    result: EngineResult;
  }[];
}
