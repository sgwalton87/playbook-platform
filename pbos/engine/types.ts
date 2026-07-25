import { PBOSWorld } from "../world";

export type EnginePhase =
  | "observe"
  | "understand"
  | "reason"
  | "plan"
  | "validate"
  | "execute"
  | "verify"
  | "learn";

export interface EngineResult {
  success: boolean;
  message: string;
  artifact?: unknown;
}

export interface PBOSEngine {

  id: string;

  name: string;

  phase: EnginePhase;

  dependsOn: string[];

  enabled: boolean;

  run(
    world: PBOSWorld
  ): Promise<EngineResult> | EngineResult;

}
