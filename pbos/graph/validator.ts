import type { GraphNode, GraphValidation } from "./types";

export function validateGraph(
  nodes: GraphNode[]
): GraphValidation {

  const ids = new Set(nodes.map(n => n.id));

  const errors: string[] = [];

  for (const node of nodes) {
    for (const dep of node.dependsOn) {
      if (!ids.has(dep)) {
        errors.push(
          `${node.id} depends on missing engine "${dep}"`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
