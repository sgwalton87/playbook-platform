import { PBOSEngine } from "./types";

const engines: PBOSEngine[] = [];

export function registerEngine(
  engine: PBOSEngine
) {
  engines.push(engine);
}

export function getRegisteredEngines() {
  return [...engines];
}

export function getEnginesForPhase(
  phase: PBOSEngine["phase"]
) {
  return engines.filter(
    e => e.phase === phase && e.enabled
  );
}
