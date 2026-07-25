import type { PBOSWorld } from "../world";
import type { EngineResult, EnginePhase, PBOSEngine } from "./types";

export abstract class BaseEngine implements PBOSEngine {
  abstract id: string;

  abstract name: string;

  abstract phase: EnginePhase;

  enabled = true;

  dependsOn: string[] = [];

  abstract run(
    world: PBOSWorld
  ): Promise<EngineResult> | EngineResult;
}