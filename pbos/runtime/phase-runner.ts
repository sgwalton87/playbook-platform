import { getEnginesForPhase } from "../engine";
import { PBOSWorld } from "../world";
import { PhaseResult } from "./phase-result";
import { verifyStoredRepositoryContext } from "../context";
import { addBlocker } from "./state-manager";

export async function runPhase(
  phase: Parameters<typeof getEnginesForPhase>[0],
  world: PBOSWorld
): Promise<PhaseResult> {

  const startedAt = new Date().toISOString();

  const engines = getEnginesForPhase(phase);

  const results: PhaseResult["engines"] = [];

  if (phase === "execute") {
    const contextValidation = verifyStoredRepositoryContext();

    if (!contextValidation.valid) {
      const message = contextValidation.errors.join(" ");
      addBlocker(message);

      return {
        phase,
        startedAt,
        finishedAt: new Date().toISOString(),
        engines: [
          {
            id: "PBOS-CONTEXT-001",
            result: {
              success: false,
              message,
              artifact: contextValidation,
            },
          },
        ],
      };
    }
  }

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
