import type {
  GraphFinding,
  GraphValidation,
  KernelObjective,
} from "./types";

const ID_PATTERN = /^[A-Z0-9][A-Z0-9._-]*$/;

export class DependencyGraph {
  validate(
    objectives: KernelObjective[],
    rootObjectiveIds: string[]
  ): GraphValidation {
    const findings: GraphFinding[] = [];
    const nodes = new Map<string, KernelObjective>();
    const roots = new Set(rootObjectiveIds);

    for (const objective of objectives) {
      if (!ID_PATTERN.test(objective.id)) {
        findings.push(this.finding("INVALID_ID", objective.id, null, "Objective identifier is invalid."));
      }
      if (nodes.has(objective.id)) {
        findings.push(this.finding("DUPLICATE_ID", objective.id, null, "Objective identifier is duplicated."));
      } else {
        nodes.set(objective.id, objective);
      }
    }

    for (const root of roots) {
      if (!nodes.has(root)) {
        findings.push(this.finding("MISSING_ROOT", null, root, "Declared root does not exist."));
      }
    }

    const adjacency = new Map<string, string[]>();
    const indegree = new Map<string, number>();
    for (const id of nodes.keys()) {
      adjacency.set(id, []);
      indegree.set(id, 0);
    }

    for (const objective of nodes.values()) {
      if (objective.parentId === null && !roots.has(objective.id)) {
        findings.push(this.finding("ORPHAN", objective.id, null, "Objective has no parent and is not a declared root."));
      }
      if (objective.parentId !== null && !nodes.has(objective.parentId)) {
        findings.push(this.finding("MISSING_PARENT", objective.id, objective.parentId, "Parent objective does not exist."));
      }
      for (const reference of objective.dependencyIds) {
        if (!nodes.has(reference)) {
          findings.push(this.finding("MISSING_DEPENDENCY", objective.id, reference, "Dependency does not exist."));
          continue;
        }
        adjacency.get(reference)?.push(objective.id);
        indegree.set(objective.id, (indegree.get(objective.id) ?? 0) + 1);
      }
      for (const child of objective.childIds ?? []) {
        const childNode = nodes.get(child);
        if (!childNode) {
          findings.push(this.finding("MISSING_CHILD", objective.id, child, "Declared child does not exist."));
        } else if (childNode.parentId !== objective.id) {
          findings.push(this.finding("INVALID_CHILD_REFERENCE", objective.id, child, "Child does not reference its declared parent."));
        }
      }
    }

    const queue = [...nodes.keys()]
      .filter((id) => indegree.get(id) === 0)
      .sort();
    const order: string[] = [];
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const id = queue[cursor];
      order.push(id);
      for (const dependent of (adjacency.get(id) ?? []).sort()) {
        const remaining = (indegree.get(dependent) ?? 0) - 1;
        indegree.set(dependent, remaining);
        if (remaining === 0) queue.push(dependent);
      }
    }
    if (order.length !== nodes.size) {
      for (const [id, degree] of indegree) {
        if (degree > 0) findings.push(this.finding("CYCLE", id, null, "Objective participates in a dependency cycle."));
      }
    }

    const reachable = new Set<string>();
    const childrenByParent = new Map<string, string[]>();
    for (const objective of nodes.values()) {
      if (objective.parentId) {
        const children = childrenByParent.get(objective.parentId) ?? [];
        children.push(objective.id);
        childrenByParent.set(objective.parentId, children);
      }
    }
    const stack = [...roots];
    while (stack.length) {
      const id = stack.pop();
      if (!id || reachable.has(id) || !nodes.has(id)) continue;
      reachable.add(id);
      stack.push(...(childrenByParent.get(id) ?? []));
    }
    for (const id of nodes.keys()) {
      if (!reachable.has(id)) findings.push(this.finding("UNREACHABLE", id, null, "Objective is unreachable from a declared root."));
    }

    return {
      valid: findings.length === 0,
      nodeCount: nodes.size,
      edgeCount: [...nodes.values()].reduce((sum, item) => sum + item.dependencyIds.length, 0),
      topologicalOrder: order,
      findings: findings.sort((a, b) =>
        `${a.code}:${a.objectiveId ?? ""}:${a.reference ?? ""}`.localeCompare(
          `${b.code}:${b.objectiveId ?? ""}:${b.reference ?? ""}`
        )
      ),
    };
  }

  private finding(code: string, objectiveId: string | null, reference: string | null, message: string): GraphFinding {
    return { code, objectiveId, reference, message };
  }
}
