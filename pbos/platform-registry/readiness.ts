import { buildPlatformRegistry } from "./registry";
import { PLATFORM_RESOURCE_STATUSES, type PlatformReadinessAssessment, type PlatformResource, type PlatformResourceStatus } from "./types";

const WEIGHTS: Record<PlatformResourceStatus, number> = { IMPLEMENTED: 1, PARTIAL: 0.5, DEMO_ONLY: 0.2, BLOCKED: 0, MISSING: 0 };

function score(resources: readonly PlatformResource[]): number {
  if (resources.length === 0) return 0;
  return Math.round((resources.reduce((sum, item) => sum + WEIGHTS[item.status], 0) / resources.length) * 100);
}

export function assessPlatformReadiness(): PlatformReadinessAssessment {
  const registry = buildPlatformRegistry();
  const statusCounts = Object.fromEntries(PLATFORM_RESOURCE_STATUSES.map((status) => [status, 0])) as Record<PlatformResourceStatus, number>;
  registry.resources.forEach(({ status }) => { statusCounts[status] += 1; });
  const controls = registry.resources.filter(({ kind }) => kind === "PRODUCTION_CONTROL");
  const features = registry.resources.filter(({ kind }) => kind === "FEATURE");
  const blockers = registry.resources.filter(({ status }) => status === "BLOCKED" || status === "MISSING").map(({ id }) => id).sort();
  const priority = ["CONTROL:OBSERVABILITY", "CONTROL:RECOVERY", "ROLE:ADMINISTRATOR", "FEATURE:SCHOLAR_GOVERNED_LOOP"];
  const recommended = priority.find((id) => blockers.includes(id)) ?? blockers[0] ?? null;
  return {
    registry_id: registry.registry_id,
    registry_version: registry.version,
    maturity_percent: score(registry.resources),
    infrastructure_readiness_percent: score(controls),
    production_readiness_percent: controls.every(({ status }) => status === "IMPLEMENTED") ? 100 : score(controls),
    feature_completion_percent: score(features),
    status_counts: statusCounts,
    blocking_dependencies: blockers,
    recommended_next_mission: recommended,
  };
}
