import { AdapterRegistry } from "../adapters/registry";
import { planConstitutionalGate } from "../planner";
import { appendHistoryAndLedger } from "./docs";
import { loadConfig } from "./config";
import { evaluatePlanningRules, loadGates } from "./planner";
import { createReport, writeReport } from "./reporter";
import { loadState, saveState, updateStateForPlanning } from "./state";
import { validateGatePlanning } from "./validator";
import type { ExecutionMode } from "./types";

function parseMode(mode: string | undefined): ExecutionMode {
  const requested = mode ?? "planning";
  if (["planning", "execution", "audit", "doctor", "release", "ship"].includes(requested)) {
    return requested as ExecutionMode;
  }
  throw new Error(`Unsupported PBOS execution mode: ${requested}`);
}

export async function runNext(rootDir = process.cwd(), requestedMode?: string): Promise<string> {
  const startedAt = Date.now();
  const config = await loadConfig(rootDir);
  const mode = parseMode(requestedMode ?? config.defaultMode);
  if (mode !== "planning") {
    throw new Error(`PBOS Engine v3 supports ${mode} as a reusable mode name, but only planning mode is authorized in this milestone.`);
  }

  const state = await loadState(config, mode, rootDir);
  const gates = await loadGates(config, rootDir);
  const plan = await planConstitutionalGate({ rootDir });
  const ruleResults = evaluatePlanningRules({
    gates,
    config,
    state,
    plan,
  });
  const validationResults = await validateGatePlanning(plan.selectedGate, config, ruleResults);
  const adapterResults = await Promise.all(new AdapterRegistry().all().map((adapter) => adapter.run({ config, rootDir })));
  const adapterValidationResults = adapterResults.map((result) => ({
    id: result.id,
    severity: result.passed ? "info" as const : "error" as const,
    passed: result.passed,
    message: result.message,
    remediation: result.passed ? "No remediation required." : "Repair the adapter stage before authorizing execution mode.",
    handbookReference: "pbos/README.md#architecture",
  }));
  const allValidationResults = [...validationResults, ...adapterValidationResults];
  const blockers = allValidationResults.filter((result) => !result.passed).map((result) => result.id);
  const nextState = updateStateForPlanning(state, plan.selectedGate?.id ?? null, blockers);
  await saveState(config, nextState, rootDir);
  const report = createReport({
    config,
    mode,
    selectedGate: plan.selectedGate,
    validationResults: allValidationResults,
    duration: Date.now() - startedAt,
    planningRecommendation: plan.reasonSelected,
    release: nextState.release,
  });
  await writeReport(report, config, rootDir);
  await appendHistoryAndLedger(report, config, rootDir);

  return [
    `PBOS next selected: ${plan.selectedGate ? `${plan.selectedGate.id} — ${plan.selectedGate.title}` : "No eligible gate"}`,
    `Mode: ${mode}; no application code changes were made.`,
    "",
    "Eligible gates:",
    ...(plan.eligibleGates.length > 0 ? plan.eligibleGates.map((gateId) => `- ${gateId}`) : ["- None"]),
    "",
    "Blocked gates:",
    ...(plan.blockedGates.length > 0
      ? plan.blockedGates.map(({ gateId, reasons }) => `- ${gateId}: ${reasons.map((reason) => reason.message).join(" ")}`)
      : ["- None"]),
    "",
    `Dependency Graph: ${plan.dependencyGraphSummary.nodeCount} nodes, ${plan.dependencyGraphSummary.edgeCount} edges`,
    `Required Artifacts: ${plan.requiredArtifacts.join(", ") || "none"}`,
    `Expected Deliverables: ${plan.expectedDeliverables.join(", ") || "none"}`,
    `Recommendation: ${plan.reasonSelected}`,
  ].join("\n");
}
