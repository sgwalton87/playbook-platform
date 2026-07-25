import type { ExecutionNode } from "./resolver";

export function sortExecutionGraph(
  nodes: ExecutionNode[]
): string[] {

  const sorted: string[] = [];

  const remaining = [...nodes];

  while (remaining.length > 0) {

    const ready = remaining.filter(node =>
      node.dependsOn.every(dep => sorted.includes(dep))
    );

    if (ready.length === 0) {
      throw new Error(
        "Circular dependency detected in ENGINE_REGISTRY."
      );
    }

    for (const node of ready) {
      sorted.push(node.id);

      const index = remaining.findIndex(
        n => n.id === node.id
      );

      remaining.splice(index, 1);
    }
  }

  return sorted;
}
