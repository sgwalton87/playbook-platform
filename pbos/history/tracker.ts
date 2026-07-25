import { EngineRunRecord } from "./types";

const history: EngineRunRecord[] = [];

export function recordEngineRun(
  run: EngineRunRecord
) {
  history.push(run);
}

export function getHistory() {
  return [...history];
}
