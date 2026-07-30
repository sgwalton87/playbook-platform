import {
  scholarOSNavigationItemDigest,
} from "./identity";
import type {
  ExperienceCapabilityDecision,
  ExperienceContext,
  ScholarOSNavigationItem,
} from "./types";

export function resolveScholarNavigation(
  items: readonly ScholarOSNavigationItem[],
  decisions: readonly ExperienceCapabilityDecision[],
  context: ExperienceContext
): readonly ScholarOSNavigationItem[] {
  const decisionByCapability = new Map(
    decisions.map((decision) => [decision.capability_id, decision])
  );
  return items
    .filter(
      (item) =>
        item.digest === scholarOSNavigationItemDigest(item) &&
        item.allowed_roles.includes(context.role) &&
        context.permissions.includes(item.required_permission) &&
        decisionByCapability.get(item.capability_id)?.state === "AVAILABLE"
    )
    .sort((left, right) => left.order - right.order)
    .map((item) => structuredClone(item));
}
