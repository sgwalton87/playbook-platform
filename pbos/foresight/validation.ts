import { digestValue, type PBOSRuntimeContext } from "../context";
import type { ForesightInput } from "./contracts";
import { ForesightError, foresightFailure } from "./errors";

function isValidContext(context: PBOSRuntimeContext): boolean {
  const digestInput = { ...context };
  delete (digestInput as Partial<PBOSRuntimeContext>).contextDigest;
  return context.documentInventory.length > 0 && context.contextDigest === digestValue(digestInput);
}

export function validateForesightInput(input: ForesightInput): PBOSRuntimeContext {
  if (!input.runtimeContext || !isValidContext(input.runtimeContext)) {
    throw new ForesightError([foresightFailure("INVALID_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  }
  if (input.predictionPresentedAsFact) {
    throw new ForesightError([foresightFailure("PREDICTION_PROHIBITED", "Foresight cannot present a future outcome as fact.")]);
  }
  if (input.unauthorizedDirectionRequested) {
    throw new ForesightError([foresightFailure("UNAUTHORIZED_DIRECTION", "Foresight cannot select direction, allocate resources, or execute strategy.")]);
  }
  if (Number.isNaN(Date.parse(input.generatedAt))) {
    throw new ForesightError([foresightFailure("MISSING_EVIDENCE", "A valid analysis timestamp is required.")]);
  }

  const contextDigest = input.runtimeContext.contextDigest;
  const invalidSource =
    !input.discoveryReports.length ||
    !input.knowledgeReports.length ||
    !input.simulationReports.length ||
    input.discoveryReports.some((report) => report.runtimeContextDigest !== contextDigest || !report.evidenceBundle.length) ||
    input.knowledgeReports.some((report) => report.runtimeContextDigest !== contextDigest || !report.evidenceBundle.length) ||
    input.simulationReports.some((report) => report.runtimeContextDigest !== contextDigest || !report.evidenceBundle.length) ||
    input.strategyReports.some((report) => report.runtimeContextDigest !== contextDigest || !report.evidenceBundle.length);
  if (invalidSource) {
    throw new ForesightError([foresightFailure("MISSING_EVIDENCE", "Discovery, knowledge, simulation, and strategy inputs must be evidence-bound to the active context.")]);
  }

  const availableEvidence = new Set([
    ...input.discoveryReports.flatMap((report) => report.evidenceBundle),
    ...input.knowledgeReports.flatMap((report) => report.evidenceBundle),
    ...input.simulationReports.flatMap((report) => report.evidenceBundle),
    ...input.strategyReports.flatMap((report) => report.evidenceBundle),
  ]);
  const referencedEvidence = [
    ...input.trendDrafts.flatMap((trend) => trend.supportingEvidence),
    ...input.emergingSignalDrafts.flatMap((signal) => signal.sourceEvidence),
    ...input.futureConditionDrafts.flatMap((condition) => condition.supportingEvidence),
    ...input.preparednessDrafts.flatMap((preparedness) => preparedness.supportingEvidence),
  ];
  if (!referencedEvidence.length || referencedEvidence.some((reference) => !availableEvidence.has(reference))) {
    throw new ForesightError([foresightFailure("MISSING_EVIDENCE", "Foresight artifacts may only cite validated source evidence.")]);
  }

  const unsupportedTrend = input.trendDrafts.some(
    (trend) =>
      !trend.supportingEvidence.length ||
      !trend.originatingSignalIds.length ||
      !trend.historicalReferences.length ||
      !trend.limitations.length,
  );
  if (unsupportedTrend) {
    throw new ForesightError([foresightFailure("UNSUPPORTED_TREND", "Trends require signals, historical references, evidence, and limitations.")]);
  }
  if (input.futureConditionDrafts.some((condition) => !condition.assumptions.length || !condition.limitations.length)) {
    throw new ForesightError([foresightFailure("HIDDEN_ASSUMPTION", "Future conditions must disclose assumptions and limitations.")]);
  }
  if (input.emergingSignalDrafts.some((signal) => !signal.sourceEvidence.length || signal.recurrenceCount < 1 || !signal.limitations.length || Number.isNaN(Date.parse(signal.firstObservation)))) {
    throw new ForesightError([foresightFailure("MISSING_EVIDENCE", "Emerging signals require evidence, observation time, recurrence information, and limitations.")]);
  }
  if (Object.values(input.horizonDefinitions).some((definition) => !definition)) {
    throw new ForesightError([foresightFailure("MISSING_EVIDENCE", "Every time horizon requires a definition.")]);
  }
  const conditionDescriptions = new Set(input.futureConditionDrafts.map(({ description }) => description));
  if (input.preparednessDrafts.some((preparedness) => !conditionDescriptions.has(preparedness.futureConditionDescription))) {
    throw new ForesightError([foresightFailure("MISSING_EVIDENCE", "Preparedness records must reference a modeled future condition.")]);
  }
  return input.runtimeContext;
}
