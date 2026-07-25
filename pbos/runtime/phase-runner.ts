import { getEnginesForPhase } from "../engine";
import { PBOSWorld } from "../world";
import { PhaseResult } from "./phase-result";

export async function runPhase(
  phase: Parameters<typeof getEnginesForPhase>[0],
  world: PBOSWorld
): Promise<PhaseResult> {

  const startedAt = new Date().toISOString();

  const engines = getEnginesForPhase(phase);

  const results: PhaseResult["engines"] = [];

  for (const engine of engines) {
    const result = await engine.run(world);

    results.push({
      id: engine.id,
      result,
    });
  }

  return {
    phase,
    startedAt,
    finishedAt: new Date().toISOString(),
    engines: results,
  };
}
