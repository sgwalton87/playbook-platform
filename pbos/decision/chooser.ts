import { PBOSWorld } from "../world";
import { scoreWorld } from "./score";
import { DecisionResult } from "./types";

export function chooseNextAction(
  world: PBOSWorld
): DecisionResult {

  const candidates = scoreWorld(world);

  candidates.sort(
    (a, b) => b.score - a.score
  );

  return {
    generatedAt: new Date().toISOString(),
    winner: candidates[0],
    candidates,
  };
}
