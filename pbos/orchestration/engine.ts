import { createRepositoryKernelInput } from "../engine/kernel-repository-adapter";
import { ConstitutionalExecutionKernel } from "../kernel/execution";
import { assessMilestoneEligibility } from "./dependency-engine";
import { analyzePBOSSystemState } from "./intelligence";
import { generateCodexExecutionPackage } from "./prompt-generator";
import { recommendCanonicalMilestone } from "./recommendation";
import { GovernedPlanningEngine } from "./planning";

export async function runDevelopmentOrchestration(
  rootDir = process.cwd()
) {
  const input = await createRepositoryKernelInput(rootDir);
  const kernel = new ConstitutionalExecutionKernel().plan(input);
  const intelligence = analyzePBOSSystemState(input, kernel);
  const eligibility = input.registry.objectives.map((objective) =>
    assessMilestoneEligibility(objective, kernel)
  );
  const recommendation = recommendCanonicalMilestone(
    input,
    kernel,
    eligibility
  );
  const governedRecommendation = new GovernedPlanningEngine().recommend({
    assessment: intelligence.assessment,
    canonical: recommendation,
    eligibility,
  });
  const executionPackage =
    kernel.certification.status === "CERTIFIED" && kernel.plan
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
  };
}
