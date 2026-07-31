import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadMasterBuildManifest, type BuildMilestone } from "../manifests";
import {
  persistScholarExperiencePackageSet,
  validateScholarExperiencePackageSet,
} from "../product-factory";

export interface ProductMissionView {
  readonly objective: string;
  readonly phase: string;
  readonly completed: readonly string[];
  readonly generating: readonly string[];
  readonly next_human_decision: string;
  readonly ready: boolean;
  readonly findings: readonly string[];
  readonly package_set_digest: string | null;
}

export function evaluateProductMission(
  milestone: BuildMilestone,
  rootDir: string
): ProductMissionView | null {
  const definition = milestone.mission_control;
  if (!definition) return null;
  const evidenceFindings = definition.completed.flatMap(({ label, evidence }) =>
    evidence
      .filter((path) => !existsSync(resolve(rootDir, path)))
      .map((path) => `${label} evidence is missing: ${path}`)
  );
  const packageValidation = milestone.id === "SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001"
    ? validateScholarExperiencePackageSet(milestone, rootDir)
    : null;
  const findings = [
    ...evidenceFindings,
    ...(packageValidation?.findings ?? []),
  ];
  return {
    objective: definition.objective,
    phase: definition.phase,
    completed: definition.completed
      .filter(({ evidence }) => evidence.every((path) => existsSync(resolve(rootDir, path))))
      .map(({ label }) => label),
    generating: definition.generating.map(({ label }) => label),
    next_human_decision: definition.next_human_decision,
    ready: milestone.status === "READY" && findings.length === 0,
    findings,
    package_set_digest: packageValidation?.package_set.digest ?? null,
  };
}

export function generateProductMissionPackages(
  rootDir: string,
  milestoneId: string | null
): void {
  if (milestoneId === "SCHOLAR-EXPERIENCE-V1-PRODUCT-DEFINITION-001") {
    persistScholarExperiencePackageSet(rootDir);
  }
}

export function resolveProductMission(
  rootDir: string,
  milestoneId: string | null
): ProductMissionView | null {
  if (!milestoneId) return null;
  const milestone = loadMasterBuildManifest(rootDir).manifest.milestones.find(
    ({ id }) => id === milestoneId
  );
  return milestone ? evaluateProductMission(milestone, rootDir) : null;
}

export function formatProductMission(view: ProductMissionView): string {
  return [
    "PBOS MISSION CONTROL",
    "",
    "Objective:",
    view.objective,
    "",
    "Current Phase:",
    view.phase,
    "",
    "Completed:",
    ...view.completed.map((item) => `✓ ${item}`),
    "",
    "Generating:",
    ...view.generating.map((item) => `→ ${item}`),
    "",
    "Next Human Decision:",
    view.next_human_decision,
    "",
    "Status:",
    view.ready ? "READY FOR BUILD PACKAGE REVIEW" : "BLOCKED",
    ...(view.package_set_digest ? [`Package Set: ${view.package_set_digest}`] : []),
    ...view.findings.map((finding) => `- ${finding}`),
  ].join("\n");
}
