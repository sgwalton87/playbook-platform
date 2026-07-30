import { assessBuildReality } from "../../build-intelligence";
import { artifactDigest } from "../../kernel/identity";
import { loadMasterBuildManifest } from "../../manifests";
import { runDevelopmentOrchestration } from "../engine";

export type AutonomousBuildCycleStatus =
  | "BLOCKED"
  | "AWAITING_HUMAN_AUTHORIZATION";

export interface AutonomousBuildCycleResult {
  readonly cycle_id: string;
  readonly status: AutonomousBuildCycleStatus;
  readonly phases_completed: readonly string[];
  readonly milestone_id: string | null;
  readonly package_id: string | null;
  readonly findings: readonly string[];
  readonly mutation: "NOT_PERFORMED";
  readonly digest: string;
}

export async function runAutonomousBuildCycle(
  rootDir = process.cwd()
): Promise<AutonomousBuildCycleResult> {
  const orchestration = await runDevelopmentOrchestration(rootDir);
  const manifest = loadMasterBuildManifest(rootDir);
  const reality = assessBuildReality(
    manifest,
    orchestration.intelligence.assessment,
    orchestration.governedRecommendation
  );
  const executionPackage = orchestration.executionPackage;
  const body = {
    status: executionPackage ? "AWAITING_HUMAN_AUTHORIZATION" as const : "BLOCKED" as const,
    phases_completed: executionPackage
      ? ["OBSERVE", "ANALYZE", "RECOMMEND", "PLAN", "PACKAGE"]
      : ["OBSERVE", "ANALYZE"],
    milestone_id: orchestration.governedRecommendation.recommended_milestone,
    package_id: executionPackage?.package_id ?? null,
    findings: executionPackage
      ? ["Identity-bound human authorization is required before execution."]
      : [...reality.reasoning],
    mutation: "NOT_PERFORMED" as const,
  };
  return {
    cycle_id: `BUILD-CYCLE-${artifactDigest({ manifest: manifest.digest, reality: reality.digest }).slice(0, 16)}`,
    ...body,
    digest: artifactDigest(body),
  };
}
