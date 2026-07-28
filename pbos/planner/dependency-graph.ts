import type {
  DependencyGraph,
  DependencyNode,
  GateDefinition,
} from "./types";

export function buildDependencyGraph(
  gates: GateDefinition[]
): DependencyGraph {
  const nodes = new Map<string, DependencyNode>();
  const missingDependencies: DependencyGraph["missingDependencies"] =
    [];

  for (const gate of [...gates].sort((a, b) =>
    a.id.localeCompare(b.id)
  )) {
    if (nodes.has(gate.id)) {
      throw new Error(`Duplicate PBOS gate identifier: ${gate.id}`);
    }
    nodes.set(gate.id, {
      gate,
      dependencies: [...gate.dependencies].sort(),
      dependents: [],
    });
  }

  for (const node of nodes.values()) {
    for (const dependencyId of node.dependencies) {
      const dependency = nodes.get(dependencyId);
      if (!dependency) {
        missingDependencies.push({
          gateId: node.gate.id,
          dependencyId,
        });
      } else {
        dependency.dependents.push(node.gate.id);
        dependency.dependents.sort();
      }
    }
  }

  const cycles: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  function visit(gateId: string): void {
    if (visiting.has(gateId)) {
      const start = stack.indexOf(gateId);
      cycles.push([...stack.slice(start), gateId]);
      return;
    }
    if (visited.has(gateId)) return;

    visiting.add(gateId);
    stack.push(gateId);
    for (const dependencyId of nodes.get(gateId)?.dependencies ?? []) {
      if (nodes.has(dependencyId)) visit(dependencyId);
    }
    stack.pop();
    visiting.delete(gateId);
    visited.add(gateId);
  }

  for (const gateId of [...nodes.keys()].sort()) visit(gateId);

  return {
    nodes,
    missingDependencies,
    cycles,
  };
}
