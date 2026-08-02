import { createRepositoryKernelInput } from "../engine/kernel-repository-adapter";
import { resolveCampaignMilestoneSelection, constrainKernelInputToCampaign } from "../execution/campaign";
import { artifactDigest } from "../kernel";
import { ConstitutionalExecutionKernel } from "../kernel/execution";
import { assessMilestoneEligibility } from "./dependency-engine";
import { analyzePBOSSystemState } from "./intelligence";
import { generateCodexExecutionPackage } from "./prompt-generator";
import { recommendCanonicalMilestone } from "./recommendation";
import type { NextMilestoneRecommendation } from "./recommendation";
import { GovernedPlanningEngine } from "./planning";

export async function runDevelopmentOrchestration(
  rootDir = process.cwd()
) {
  const repositoryInput = await createRepositoryKernelInput(rootDir);
  const campaignSelection = resolveCampaignMilestoneSelection({
    rootDir,
    timestamp: new Date().toISOString(),
  });
  const constrained = constrainKernelInputToCampaign({
    kernelInput: repositoryInput,
    selection: campaignSelection,
  });
  const input = constrained.input;
  const kernel = new ConstitutionalExecutionKernel().plan(input);
  const intelligence = analyzePBOSSystemState(input, kernel);
  const eligibility = input.registry.objectives.map((objective) =>
    assessMilestoneEligibility(objective, kernel)
  );
  const canonicalRecommendation = recommendCanonicalMilestone(
    input,
    kernel,
    eligibility
  );
  const recommendation: NextMilestoneRecommendation = campaignSelection.constrained &&
    (constrained.findings.length > 0 ||
      kernel.decision.selectedObjectiveId !== campaignSelection.milestone_id)
    ? (() => {
        const target = input.registry.objectives.find(
          ({ id }) => id === campaignSelection.milestone_id,
        );
        const body: NextMilestoneRecommendation = {
          recommendation_id: `RECOMMENDATION-CAMPAIGN-${artifactDigest({
            milestone: campaignSelection.milestone_id,
            findings: constrained.findings,
            campaign: campaignSelection,
          }).slice(0, 16)}`,
          recommended_milestone: null,
          reason: campaignSelection.milestone_id
            ? [`Active campaign requires ${campaignSelection.milestone_id} before unrelated work.`]
            : ["Active campaign authority is not currently executable."],
          dependencies_satisfied: false,
          risk: target?.risk ?? 100,
          impact: "Resolve the next approved campaign package blocker before continuing.",
          confidence: 0,
          blocking_conditions: [...constrained.findings],
          evidence: [
            input.constitution.digest,
            input.registry.digest,
            kernel.decision.digest,
            kernel.certification.digest,
          ].sort(),
          authority: "PBOS-CONSTITUTIONAL-PLANNER",
          timestamp: input.observedAt,
          digest: "",
        };
        return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
      })()
    : canonicalRecommendation;
  const governedRecommendation = new GovernedPlanningEngine().recommend({
    assessment: intelligence.assessment,
    canonical: recommendation,
    eligibility,
  });
  const executionPackage =
    kernel.certification.status === "CERTIFIED" && kernel.plan &&
      recommendation.recommended_milestone !== null
      ? generateCodexExecutionPackage(
          input,
          recommendation,
          kernel.plan
        )
      : null;
  return {
    input,
    kernel,
    intelligence,
    eligibility,
    recommendation,
    governedRecommendation,
    executionPackage,
    campaignSelection,
  };
}
