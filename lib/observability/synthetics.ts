export interface SyntheticStep {
  readonly id: string;
  readonly route: string;
  readonly authentication: "public" | "scholar";
  readonly expectedHeading?: string;
}

export const GOVERNED_SCHOLAR_SYNTHETIC: readonly SyntheticStep[] = [
  { id: "public-landing", route: "/", authentication: "public" },
  { id: "authentication", route: "/login", authentication: "public", expectedHeading: "Welcome back" },
  { id: "scholar-dashboard", route: "/dashboard", authentication: "scholar" },
  { id: "scholar-record", route: "/record", authentication: "scholar" },
  { id: "portfolio", route: "/portfolio", authentication: "scholar" },
] as const;

export function validateSyntheticJourney(steps: readonly SyntheticStep[] = GOVERNED_SCHOLAR_SYNTHETIC): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const step of steps) {
    if (!step.id || ids.has(step.id)) errors.push(`Invalid or duplicate synthetic step: ${step.id}`);
    ids.add(step.id);
    if (!step.route.startsWith("/") || step.route.includes("?")) errors.push(`${step.id} must use a query-free application route.`);
  }
  if (!steps.some(({ authentication }) => authentication === "public")) errors.push("Synthetic journey requires a public step.");
  if (!steps.some(({ authentication }) => authentication === "scholar")) errors.push("Synthetic journey requires an authenticated Scholar step.");
  return errors;
}
