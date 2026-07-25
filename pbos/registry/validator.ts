import { resolveExecutionGraph } from "./resolver";

export function validateRegistry(): string[] {
  const graph = resolveExecutionGraph();

  const ids = new Set(graph.map(node => node.id));

  const errors: string[] = [];

  for (const node of graph) {
    for (const dependency of node.dependsOn) {
      if (!ids.has(dependency)) {
        errors.push(
          `${node.id} depends on unknown engine "${dependency}"`
        );
      }
    }
  }

  return errors;
}
