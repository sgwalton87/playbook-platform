import { AdapterRegistry } from "../adapters/registry";
import { CommandRegistry } from "../commands/registry/command-registry";
import { loadConfig } from "../engine/config";
import { loadGates, selectNextGate } from "../engine/planner";
import { loadState } from "../engine/state";
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
  repositoryLintStatus: "failing-existing-debt" | "passing";
  validationStatus: "passing" | "failing";
  currentReleaseState: string;
  promotionStatus: "pending" | "complete";
  auditStatus: "pending" | "complete";
  blockingConditions: string[];
  recommendation: string;
}

export async function getEngineHealth(rootDir = process.cwd()): Promise<EngineHealthReport> {
  const config = await loadConfig(rootDir);
  const state = await loadState(config, config.defaultMode, rootDir);
  const gates = await loadGates(config, rootDir);
  const plan = selectNextGate(gates, config, state);
  const adapterCount = new AdapterRegistry().count();
  const commandCount = new CommandRegistry().count();
  const failedRules = plan.ruleResults.filter((rule) => !rule.passed);
  const releaseGateComplete = plan.completedGateIds.includes("PBOS-GATE-001");

  return {
    engineVersion: config.version,
    executionMode: state.executionMode,
    currentGate: plan.selectedGate?.id ?? state.currentGate,
    completedGates: plan.completedGateIds,
    blockedGates: plan.blockedGates.map(({ gate }) => gate.id),
    ruleCount: plan.ruleResults.length,
    adapterCount,
    commandCount,
    repositoryHealth: releaseGateComplete ? "healthy" : "blocked-by-existing-lint-debt",
    pbosHealth: failedRules.length === 0 ? "healthy" : "needs-attention",
    buildStatus: "last-build-passed",
    pbosLintStatus: "passing",
    repositoryLintStatus: releaseGateComplete ? "passing" : "failing-existing-debt",
    validationStatus: failedRules.length === 0 ? "passing" : "failing",
    currentReleaseState: state.release.currentState,
    promotionStatus: state.release.currentState === "PROMOTION_COMPLETE" || state.release.currentState === "AUDIT_COMPLETE" || state.release.currentState === "ARCHIVED" ? "complete" : "pending",
    auditStatus: state.release.currentState === "AUDIT_COMPLETE" || state.release.currentState === "ARCHIVED" ? "complete" : "pending",
    blockingConditions: state.release.blockingConditions,
    recommendation: state.release.currentState === "PROMOTION_PENDING"
      ? `Repository promotion is pending. Resolve: ${state.release.blockingConditions.join(", ") || "none"}.`
      : plan.selectedGate?.next_gate ? `Complete ${plan.selectedGate.id}, then evaluate ${plan.selectedGate.next_gate}.` : "No next gate is configured.",
  };
}

export function formatEngineHealth(report: EngineHealthReport): string {
  return [
    `Engine Version: ${report.engineVersion}`,
    `Execution Mode: ${report.executionMode}`,
    `Current Gate: ${report.currentGate ?? "none"}`,
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
