import { PBOSWorld } from "../world";
import { DecisionOption } from "./types";

export function scoreWorld(
  world: PBOSWorld
): DecisionOption[] {

  const decisions: DecisionOption[] = [];

  // Validation failed
  if (
    world.validation &&
    (world.validation as any).success === false
  ) {
    decisions.push({
      id: "fix-validation",
      title: "Repair validation failures",
      score: 100,
      reasons: [
        "Validation failed."
      ],
    });
  }

  // Doctor failed
  if (
    world.doctor &&
    (world.doctor as any).success === false
  ) {
    decisions.push({
      id: "repair-health",
      title: "Repair system health",
      score: 90,
      reasons: [
        "Doctor reported failures."
      ],
    });
  }

  // Default recommendation
  if (decisions.length === 0) {
    decisions.push({
      id: "continue-roadmap",
      title: "Proceed to next roadmap gate",
      score: 10,
      reasons: [
        "System is healthy."
      ],
    });
  }

  return decisions;
}
