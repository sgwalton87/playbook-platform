import { AdapterRegistry } from "../adapters/registry";
import { CommandRegistry } from "../commands/registry/command-registry";
import { loadConfig } from "../engine/config";
import { evaluatePlanningRules, loadGates } from "../engine/planner";
import { loadState } from "../engine/state";
import { planConstitutionalGate } from "../planner";
import type { ExecutionMode } from "../engine/types";

export interface EngineHealthReport {
  engineVersion: string;
  executionMode: ExecutionMode;
  currentGate: string | null;
  completedGates: string[];
  blockedGates: string[];
  ruleCount: number;
  adapterCount: number;
  commandCount: number;
  repositoryHealth: "blocked-by-existing-lint-debt" | "healthy";
  pbosHealth: "healthy" | "needs-attention";
  buildStatus: "last-build-passed";
  pbosLintStatus: "passing";
  repositoryLintStatus: "failing-existing-debt";
  validationStatus: "passing" | "failing";
  currentReleaseState: string;
  promotionStatus: "pending" | "complete";
  auditStatus: "pending" | "complete";
  blockingConditions: string[];
  recommendation: string;
  currentConstitutionalPosition: string;
  currentDependencyNode: string | null;
  planningHealth: "HEALTHY" | "BLOCKED";
  planningRecommendation: string;
}

export async function getEngineHealth(rootDir = process.cwd()): Promise<EngineHealthReport> {
  const config = await loadConfig(rootDir);
  const state = await loadState(config, config.defaultMode, rootDir);
  const gates = await loadGates(config, rootDir);
  const constitutionalPlan = await planConstitutionalGate({
    rootDir,
    persist: false,
  });
  const adapterCount = new AdapterRegistry().count();
  const commandCount = new CommandRegistry().count();
  const ruleResults = evaluatePlanningRules({
    gates,
    config,
    state,
    plan: constitutionalPlan,
  });
  const failedRules = ruleResults.filter((rule) => !rule.passed);

  return {
    engineVersion: config.version,
    executionMode: state.executionMode,
    currentGate: constitutionalPlan.selectedGate?.id ?? state.currentGate,
    completedGates: constitutionalPlan.completedGates,
    blockedGates: constitutionalPlan.blockedGates.map(({ gateId }) => gateId),
    ruleCount: ruleResults.length,
    adapterCount,
    commandCount,
    repositoryHealth: "blocked-by-existing-lint-debt",
    pbosHealth: failedRules.length === 0 ? "healthy" : "needs-attention",
    buildStatus: "last-build-passed",
    pbosLintStatus: "passing",
    repositoryLintStatus: "failing-existing-debt",
    validationStatus: failedRules.length === 0 ? "passing" : "failing",
    currentReleaseState: state.release.currentState,
    promotionStatus: state.release.currentState === "PROMOTION_COMPLETE" || state.release.currentState === "AUDIT_COMPLETE" || state.release.currentState === "ARCHIVED" ? "complete" : "pending",
    auditStatus: state.release.currentState === "AUDIT_COMPLETE" || state.release.currentState === "ARCHIVED" ? "complete" : "pending",
    blockingConditions: state.release.blockingConditions,
    recommendation: constitutionalPlan.reasonSelected,
    currentConstitutionalPosition:
      constitutionalPlan.recommendedNextGate ??
      state.currentGate ??
      "No eligible constitutional gate",
    currentDependencyNode: constitutionalPlan.currentDependencyNode,
    planningHealth: constitutionalPlan.planningHealth,
    planningRecommendation: constitutionalPlan.reasonSelected,
  };
}

export function formatEngineHealth(report: EngineHealthReport): string {
  return [
    `Engine Version: ${report.engineVersion}`,
    `Execution Mode: ${report.executionMode}`,
    `Current Gate: ${report.currentGate ?? "none"}`,
    `Current Constitutional Position: ${report.currentConstitutionalPosition}`,
    `Current Dependency Node: ${report.currentDependencyNode ?? "none"}`,
    `Planning Health: ${report.planningHealth}`,
    `Planning Recommendation: ${report.planningRecommendation}`,
    `Completed Gates: ${report.completedGates.join(", ") || "none"}`,
    `Blocked Gates: ${report.blockedGates.join(", ") || "none"}`,
    `Rule Count: ${report.ruleCount}`,
    `Adapter Count: ${report.adapterCount}`,
    `Command Count: ${report.commandCount}`,
    `Repository Health: ${report.repositoryHealth}`,
    `PBOS Health: ${report.pbosHealth}`,
    `Build Status: ${report.buildStatus}`,
    `PBOS Lint Status: ${report.pbosLintStatus}`,
    `Repository Lint Status: ${report.repositoryLintStatus}`,
    `Validation Status: ${report.validationStatus}`,
    `Current Release State: ${report.currentReleaseState}`,
    `Promotion Status: ${report.promotionStatus}`,
    `Audit Status: ${report.auditStatus}`,
    `Blocking Conditions: ${report.blockingConditions.join(", ") || "none"}`,
    `Recommendation: ${report.recommendation}`,
  ].join("\n");
}
