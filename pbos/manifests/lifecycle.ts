import type { BuildMilestone } from "./types";

export type ResolvedBuildMilestoneState =
  | "COMPLETED"
  | "READY"
  | "PLANNED"
  | "IN_PROGRESS"
  | "BLOCKED";

export interface BuildMilestoneLifecycleResolution {
  readonly milestone_id: string;
  readonly declared_state: BuildMilestone["status"];
  readonly resolved_state: ResolvedBuildMilestoneState;
  readonly dependencies: readonly string[];
  readonly incomplete_dependencies: readonly string[];
  readonly reason: string;
}

export function resolveBuildMilestoneLifecycle(
  milestone: BuildMilestone,
  completedMilestones: ReadonlySet<string>
): BuildMilestoneLifecycleResolution {
  const dependencies = [
    ...new Set([...milestone.dependencies, ...milestone.blocking_dependencies]),
  ].sort();
  const incomplete = dependencies.filter(
    (dependency) => !completedMilestones.has(dependency)
  );
  let resolved: ResolvedBuildMilestoneState = "BLOCKED";
  let reason = `Declared state ${milestone.status} is not executable.`;

  if (
    completedMilestones.has(milestone.id) ||
    milestone.status === "COMPLETE" ||
    milestone.status === "ARCHIVED"
  ) {
    resolved = "COMPLETED";
    reason = "Completion is preserved by canonical manifest or advancement history.";
  } else if (milestone.status === "READY" && incomplete.length === 0) {
    resolved = "READY";
    reason = "Manifest declares readiness and every dependency is complete.";
  } else if (milestone.status === "PLANNED" && incomplete.length === 0) {
    resolved = "PLANNED";
    reason = "Manifest planning state is dependency-valid.";
  } else if (
    ["AUTHORIZED", "IN_PROGRESS", "VALIDATING"].includes(milestone.status) &&
    incomplete.length === 0
  ) {
    resolved = "IN_PROGRESS";
    reason = "Manifest execution state is dependency-valid.";
  } else if (
    milestone.status === "DEFINED" &&
    dependencies.length > 0 &&
    incomplete.length === 0
  ) {
    resolved = "READY";
    reason = "Defined downstream work is unlocked by completed dependencies.";
  } else if (incomplete.length > 0) {
    reason = `Dependencies are incomplete: ${incomplete.join(", ")}.`;
  } else if (milestone.status === "DEFINED" && dependencies.length === 0) {
    reason = "Root defined work requires an explicit READY declaration.";
  }

  return {
    milestone_id: milestone.id,
    declared_state: milestone.status,
    resolved_state: resolved,
    dependencies,
    incomplete_dependencies: incomplete,
    reason,
  };
}
