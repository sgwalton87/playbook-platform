import { ENGINE_REGISTRY } from "./engines";

export interface ExecutionNode {
  id: string;
  dependsOn: string[];
}

export function resolveExecutionGraph(): ExecutionNode[] {
  return ENGINE_REGISTRY.map(engine => ({
    id: engine.id,
    dependsOn: [...engine.dependsOn],
  }));
}
