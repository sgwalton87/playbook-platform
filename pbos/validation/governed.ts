import { digestValue, type PBOSRuntimeContext } from "../context";
import type {
  GovernedValidationInput,
  GovernedValidationResult,
  GovernedValidationStatus,
  ValidationEvidenceItem,
} from "./governed-contracts";

const COMMIT = /^[a-f0-9]{7,64}$/;

function expectedContextDigest(context: PBOSRuntimeContext): string {
  const { contextDigest: _contextDigest, ...digestInput } = context;
  return digestValue(digestInput);
}

function requirementKeys(input: GovernedValidationInput): string[] {
  const plan = input.executionContract.plan;
  return [
    ...plan.requiredValidations.map((item) => `validation:${item}`),
    ...plan.satisfiedDependencies.map((item) => `dependency:${item}`),
    ...plan.requiredActions.map((item) => `implementation:${item}`),
    ...plan.completionCriteria.map((item) => `completion:${item}`),
    ...plan.constraints.map((item) => `constitutional:${item}`),
    "release:readiness",
  ].sort();
}

function evidenceMap(items: ValidationEvidenceItem[]): Map<string, ValidationEvidenceItem> {
  return new Map([...items].sort((left, right) => left.identifier.localeCompare(right.identifier)).map((item) => [item.requirement, item]));
}

export function validateExecutionOutcome(input: GovernedValidationInput): GovernedValidationResult {
  const plan = input.executionContract.plan;
  const blockingConditions: string[] = [];
  const context = input.runtimeContext;
  if (!context || context.contextDigest !== expectedContextDigest(context) || !context.documentInventory.length) {
    blockingConditions.push("Runtime Context authority is missing or invalid.");
  }
  if (context?.exclusionRecords.length || context?.constraints.some((constraint) => constraint.kind === "execution-block")) {
    blockingConditions.push("Constitutional exclusions or execution blocks remain unresolved.");
  }
  if (
    input.executionContract.approvalStatus !== "approved" ||
    !input.executionContract.approvalIdentifier ||
    input.executionContract.planDigest !== digestValue(plan)
  ) {
    blockingConditions.push("Execution contract approval or digest is invalid.");
  }
  if (
    !plan.executionId ||
    !plan.requiredActions.length ||
    !plan.requiredValidations.length ||
    !plan.completionCriteria.length
  ) {
    blockingConditions.push("Execution contract is incomplete.");
  }
  if (
    !input.repositoryEvidence.branch.trim() ||
    !COMMIT.test(input.repositoryEvidence.commit) ||
    input.repositoryEvidence.workingTree !== "clean" ||
    !input.repositoryEvidence.changedFiles.length
  ) {
    blockingConditions.push("Repository evidence is missing, dirty, or unidentified.");
  }

  const duplicateEvidence = input.validationEvidence
    .map((item) => item.requirement)
    .filter((item, index, values) => values.indexOf(item) !== index);
  if (duplicateEvidence.length) blockingConditions.push("Validation evidence contains conflicting duplicate requirements.");

  const required = requirementKeys(input);
  const evidence = evidenceMap(input.validationEvidence);
  const missingEvidence = required.filter((requirement) => !evidence.has(requirement));
  const failedRequirements = required.filter((requirement) => evidence.get(requirement)?.status === "FAIL");
  const satisfiedRequirements = required.filter((requirement) => evidence.get(requirement)?.status === "PASS");
  const evidenceReferences = input.validationEvidence
    .flatMap((item) => item.evidenceReferences)
    .filter((item, index, values) => values.indexOf(item) === index)
    .sort();

  const status: GovernedValidationStatus = blockingConditions.length || missingEvidence.length
    ? "BLOCKED"
    : failedRequirements.length
      ? "FAIL"
      : "PASS";
  const remediationRecommendations = [
    ...blockingConditions.map((condition) => `Resolve blocker: ${condition}`),
    ...missingEvidence.map((requirement) => `Provide evidence for ${requirement}.`),
    ...failedRequirements.map((requirement) => `Remediate and rerun ${requirement}.`),
  ].sort();
  const resultBody = {
    executionId: plan.executionId,
    status,
    satisfiedRequirements,
    failedRequirements,
    missingEvidence,
    blockingConditions: [...blockingConditions].sort(),
    evidenceReferences,
    remediationRecommendations,
  };

  return {
    validationId: `PBOS-VAL-${digestValue({
      contextDigest: context?.contextDigest,
      executionContract: input.executionContract,
      repositoryEvidence: input.repositoryEvidence,
      result: resultBody,
    }).slice(0, 16).toUpperCase()}`,
    ...resultBody,
  };
}
