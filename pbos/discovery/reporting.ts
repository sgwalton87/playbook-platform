import { digestValue } from "../context";
import type { DiscoveryInput, DiscoveryOpportunity, DiscoveryReport, DiscoveryRisk, DiscoveredSignal } from "./governed-contracts";
import { validateDiscoveryInput } from "./sources";

export function createDiscoveryReport(input: DiscoveryInput, signals: DiscoveredSignal[], opportunities: DiscoveryOpportunity[], risks: DiscoveryRisk[]): DiscoveryReport {
  const sourceInventory = validateDiscoveryInput(input);
  const discoveredSignals = [...signals].sort((a, b) => a.signalId.localeCompare(b.signalId));
  const sortedOpportunities = [...opportunities].sort((a, b) => a.opportunityId.localeCompare(b.opportunityId));
  const sortedRisks = [...risks].sort((a, b) => a.riskId.localeCompare(b.riskId));
  const evidenceBundle = [...new Set([...sourceInventory.flatMap((x) => x.evidenceReferences), ...discoveredSignals.flatMap((x) => x.evidenceReferences), ...input.informationGaps.flatMap((x) => x.evidenceReferences)])].sort();
  const recommendations = sortedOpportunities.flatMap((item) => item.recommendedNextSteps.map((recommendation) => ({ recommendation, evidenceReferences: item.supportingEvidence, advisoryOnly: true as const })));
  const body = { observationTimestamp: input.observationTimestamp, runtimeContextDigest: input.runtimeContext!.contextDigest, sourceInventory, discoveredSignals, opportunities: sortedOpportunities, risks: sortedRisks, informationGaps: [...input.informationGaps].sort((a, b) => a.domain.localeCompare(b.domain)), recommendations, confidenceClassifications: discoveredSignals.map((x) => x.confidenceClassification), evidenceBundle };
  return { reportId: `PBOS-DISC-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
