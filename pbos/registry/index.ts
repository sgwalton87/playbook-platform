import { ENGINE_REGISTRY } from "./engines";
import { EngineDefinition } from "./types";

export function getEngineRegistry(): EngineDefinition[] {
  return ENGINE_REGISTRY
    .filter(engine => engine.enabled)
    .sort((a, b) => a.order - b.order);
}
