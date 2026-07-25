import { chooseNextAction } from "../decision";
import { Observation, Reasoning } from "./types";

export function reason(
  observation: Observation
): Reasoning {

  return {
    observation,
    decision: chooseNextAction(
      observation.world
    ),
  };

}
