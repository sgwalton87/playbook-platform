import { artifactDigest } from "../../kernel/identity";
import type { CodexExecutionPackage } from "../../orchestration";
import type { ExecutionEvidenceBundle } from "./types";

export interface MilestoneAdvancementAssessment {
  readonly milestone_id: string;
  readonly eligible: boolean;
  readonly findings: readonly string[];
  readonly evidence_digest: string;
  readonly digest: string;
}

export function assessMilestoneAdvancement(input: {
  readonly package: CodexExecutionPackage;
  readonly evidence: ExecutionEvidenceBundle;
}): MilestoneAdvancementAssessment {
  const findings = [
    ...(!input.evidence.completion.complete
      ? ["Execution completion evidence is incomplete."]
      : []),
    ...(!input.evidence.completion.advancement_eligible
      ? ["Execution evidence does not permit advancement."]
      : []),
    ...(input.evidence.completion.evidence_status !== "VALIDATED"
      ? ["Execution evidence is not validated."]
      : []),
    ...(input.evidence.record.package_digest !== input.package.digest
      ? ["Execution evidence package identity does not match."]
      : []),
    ...(input.evidence.record.status !== "SUCCEEDED"
      ? ["Execution did not succeed."]
      : []),
    ...(input.evidence.record.milestone_id !== input.package.milestone_id
      ? ["Execution evidence milestone identity does not match."]
      : []),
  ];
  const body = {
    milestone_id: input.package.milestone_id,
    eligible: findings.length === 0,
    findings,
    evidence_digest: input.evidence.digest,
  };
  return { ...body, digest: artifactDigest(body) };
}
