import { artifactDigest } from "../identity";
import type { EngineManifest } from "../admission";
import type {
  EngineDependencyFinding,
  EngineDependencyGraph,
} from "./types";

function finding(
  code: EngineDependencyFinding["code"],
  engineId: string,
  dependencyId: string | null,
  message: string
): EngineDependencyFinding {
  return {
    code,
    engine_id: engineId,
    dependency_id: dependencyId,
    message,
  };
}

export function buildEngineDependencyGraph(
  manifests: readonly EngineManifest[]
): EngineDependencyGraph {
  const findings: EngineDependencyFinding[] = [];
  const nodes = new Map<string, EngineManifest>();
  for (const manifest of manifests) {
    if (nodes.has(manifest.engine_id)) {
      findings.push(
        finding(
          "DUPLICATE_ENGINE",
          manifest.engine_id,
          null,
          "Engine identity is duplicated."
        )
      );
      continue;
    }
    nodes.set(manifest.engine_id, manifest);
  }

  const dependents = new Map<string, string[]>();
  const indegree = new Map<string, number>();
  for (const id of nodes.keys()) {
    dependents.set(id, []);
    indegree.set(id, 0);
  }
  for (const manifest of nodes.values()) {
    for (const dependencyId of manifest.dependencies) {
      if (dependencyId === manifest.engine_id) {
        findings.push(
          finding(
            "SELF_DEPENDENCY",
            manifest.engine_id,
            dependencyId,
            "Engine cannot depend on itself."
          )
        );
        continue;
      }
      if (!nodes.has(dependencyId)) {
        findings.push(
          finding(
            "MISSING_DEPENDENCY",
            manifest.engine_id,
            dependencyId,
            "Engine dependency is unavailable."
          )
        );
        continue;
      }
      dependents.get(dependencyId)?.push(manifest.engine_id);
      indegree.set(manifest.engine_id, (indegree.get(manifest.engine_id) ?? 0) + 1);
    }
  }

  const queue = [...nodes.keys()]
    .filter((id) => indegree.get(id) === 0)
    .sort();
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift();
    if (!id) break;
    order.push(id);
    for (const dependent of [...(dependents.get(id) ?? [])].sort()) {
      const remaining = (indegree.get(dependent) ?? 0) - 1;
      indegree.set(dependent, remaining);
      if (remaining === 0) {
        queue.push(dependent);
        queue.sort();
      }
    }
  }
  if (order.length !== nodes.size) {
    for (const [id, degree] of [...indegree.entries()].sort()) {
      if (degree > 0) {
        findings.push(
          finding(
            "CIRCULAR_DEPENDENCY",
            id,
            null,
            "Engine participates in a dependency cycle."
          )
        );
      }
    }
  }

  const blocked = new Set(
    findings.map(({ engine_id: engineId }) => engineId)
  );
  const body = {
    valid: findings.length === 0,
    engine_ids: [...nodes.keys()].sort(),
    execution_order: order,
    blocked_engine_ids: [...blocked].sort(),
    findings: findings.sort((left, right) =>
      `${left.code}:${left.engine_id}:${left.dependency_id ?? ""}`.localeCompare(
        `${right.code}:${right.engine_id}:${right.dependency_id ?? ""}`
      )
    ),
  };
  return { ...body, digest: artifactDigest(body) };
}
