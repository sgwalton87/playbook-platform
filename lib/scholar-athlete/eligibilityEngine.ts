export type EligibilityRequirement = {
  id: string;
  label: string;
  required: boolean;
  completed: boolean;
  evidenceVerified: boolean;
  detail?: string;
};

export type EligibilityRuleset = {
  governingBody: "NCAA" | "NAIA" | "JUCO";
  division?: string;
  version: string;
  effectiveDate: string;
  sourceUrl: string;
  requirements: EligibilityRequirement[];
};

export function evaluateEligibilityReadiness(
  ruleset: EligibilityRuleset
) {
  const required = ruleset.requirements.filter((item) => item.required);
  const completed = required.filter((item) => item.completed);
  const verified = required.filter(
    (item) => item.completed && item.evidenceVerified
  );

  const missing = required.filter((item) => !item.completed);
  const unverified = required.filter(
    (item) => item.completed && !item.evidenceVerified
  );

  const readiness =
    required.length === 0
      ? 0
      : Math.round((completed.length / required.length) * 100);

  const verifiedReadiness =
    required.length === 0
      ? 0
      : Math.round((verified.length / required.length) * 100);

  return {
    governingBody: ruleset.governingBody,
    division: ruleset.division,
    rulesetVersion: ruleset.version,
    readiness,
    verifiedReadiness,
    missing,
    unverified,
    status:
      missing.length === 0 && unverified.length === 0
        ? "ready"
        : missing.length <= 1
          ? "close"
          : "action_needed",
  };
}

export function buildEligibilityScenario(input: {
  currentReadiness: number;
  actions: Array<{ label: string; impact: number }>;
}) {
  const projected = Math.min(
    100,
    input.currentReadiness +
      input.actions.reduce((sum, action) => sum + action.impact, 0)
  );

  return {
    current: input.currentReadiness,
    projected,
    change: projected - input.currentReadiness,
    actions: input.actions,
  };
}
