import type { VolumeCertificationRun } from "./types";

export function renderVolumeCertificationReport(
  run: VolumeCertificationRun
): string {
  const passed = run.passedRules.length
    ? run.passedRules.join(", ")
    : "None";
  const failed = run.failedRules.length
    ? run.failedRules.join(", ")
    : "None";
  const blockers = run.blockingConditions.length
    ? run.blockingConditions.map((item) => `- ${item}`).join("\n")
    : "- None";
  const ruleRows = run.rules
    .map(
      (rule) =>
        `| ${rule.id} | ${rule.name} | ${
          rule.passed ? "PASS" : "FAIL"
        } | ${rule.blockingConditions.join("; ") || "None"} |`
    )
    .join("\n");
  const recommendation = run.promotionRecommendation.eligible
    ? `Review transition to ${run.promotionRecommendation.targetLifecycle}.`
    : run.promotionRecommendation.reason;

  return `# PBOS Constitutional Certification Report

## Volume

${run.volumeId}

## Status

${run.status} (${run.lifecycle})

## Certification Score

${run.certificationScore}/100

## Passed Rules

${passed}

## Failed Rules

${failed}

## Rule Results

| Rule | Name | Result | Blocking Conditions |
| --- | --- | --- | --- |
${ruleRows}

## Blocking Conditions

${blockers}

## Promotion Recommendation

${recommendation}

No lifecycle transition was applied. Promotion requires an explicit governed action.

## Evidence Identity

- Content digest: \`${run.contentDigest}\`
- Evaluated at: ${run.evaluatedAt}
- Run ID: \`${run.runId}\`
`;
}
