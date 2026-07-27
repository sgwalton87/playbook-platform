import { digestValue } from "../context";
import { createFutureConditions } from "./conditions";
import type { ForesightInput, ForesightProvenance, ForesightReport } from "./contracts";
import { analyzeHorizons } from "./horizons";
import { createPreparednessOpportunities } from "./preparedness";
import { aggregateEmergingSignals } from "./signals";
import { createTrends } from "./trends";
import { validateForesightInput } from "./validation";

export function createForesightReport(input: ForesightInput): ForesightReport {
  const context = validateForesightInput(input);
  const evidenceBundle = [...new Set([
    ...input.discoveryReports.flatMap((report) => report.evidenceBundle),
    ...input.knowledgeReports.flatMap((report) => report.evidenceBundle),
    ...input.simulationReports.flatMap((report) => report.evidenceBundle),
    ...input.strategyReports.flatMap((report) => report.evidenceBundle),
  ])].sort();
  const provenance: ForesightProvenance = {
    runtimeContextDigest: context.contextDigest,
    discoveryReportIds: input.discoveryReports.map(({ reportId }) => reportId).sort(),
    knowledgeReportIds: input.knowledgeReports.map(({ reportId }) => reportId).sort(),
    simulationReportIds: input.simulationReports.map(({ reportId }) => reportId).sort(),
    strategyReportIds: input.strategyReports.map(({ reportId }) => reportId).sort(),
    evidenceReferences: evidenceBundle,
  };
  const trendInventory = createTrends(input.trendDrafts);
  const emergingSignals = aggregateEmergingSignals(input.emergingSignalDrafts);
  const possibleFutureConditions = createFutureConditions(input.futureConditionDrafts);
  const preparednessOpportunities = createPreparednessOpportunities(input.preparednessDrafts, possibleFutureConditions);
  const horizonAnalysis = analyzeHorizons(trendInventory, input.horizonDefinitions);
  const uncertaintyStatements = [...new Set([
    ...horizonAnalysis.map(({ uncertaintyStatement }) => uncertaintyStatement),
    ...emergingSignals.map(({ uncertaintyStatement }) => uncertaintyStatement),
    ...possibleFutureConditions.map(({ uncertaintyStatement }) => uncertaintyStatement),
  ])].sort();
  const body = {
    generatedAt: input.generatedAt,
    runtimeContextDigest: context.contextDigest,
    trendInventory,
    horizonAnalysis,
    emergingSignals,
    possibleFutureConditions,
    preparednessOpportunities,
    uncertaintyStatements,
    evidenceBundle,
    confidenceClassification: evidenceBundle.length > 4 ? "HIGH" as const : "MEDIUM" as const,
    provenance,
  };
  return { reportId: `PBOS-FOR-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
