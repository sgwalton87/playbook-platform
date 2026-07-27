import type { GovernedChangeType } from "./contracts";

const ROUTES: Record<GovernedChangeType, string[]> = {
  constitutional: ["constitutional-amendment-approval"],
  architecture: ["architecture-review-approval"],
  schema: ["data-governance-approval"],
  lifecycle: ["lifecycle-governance-approval"],
  security: ["security-governance-approval"],
  policy: ["policy-governance-approval"],
  authority: ["constitutional-governance-approval"],
  operational: ["execution-authorization"],
};

export function governanceRoute(changeType: GovernedChangeType): string[] {
  return [...ROUTES[changeType]];
}
