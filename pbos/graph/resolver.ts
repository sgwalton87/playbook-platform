import { ENGINE_REGISTRY } from "../registry/engines";
import type { GraphNode } from "./types";

export function buildDependencyGraph(): GraphNode[] {
  return ENGINE_REGISTRY.map(engine => ({
    id: engine.id,
    dependsOn: [...engine.dependsOn],
  }));
}
