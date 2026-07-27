import { digestValue } from "../context";
import type { DiscoveryInput, DiscoveredSignal } from "./governed-contracts";
import { validateDiscoveryInput } from "./sources";

export function detectSignals(input: DiscoveryInput): DiscoveredSignal[] {
  const sources = new Map(validateDiscoveryInput(input).map((source) => [source.identifier, source]));
  return [...input.observations].sort((a, b) => `${a.sourceIdentifier}:${a.observedAt}:${a.observation}`.localeCompare(`${b.sourceIdentifier}:${b.observedAt}:${b.observation}`)).map((item) => {
    const source = sources.get(item.sourceIdentifier)!;
    const body = { ...item, sourceOwnership: source.owner, sourceProvenance: source.provenance, retrievalTimestamp: source.retrievedAt };
    return {
      signalId: `PBOS-DISC-SIG-${digestValue(body).slice(0, 16).toUpperCase()}`,
      signalType: item.signalType, sourceReference: item.sourceIdentifier, sourceIdentity: source.identifier,
      sourceOwnership: source.owner, sourceProvenance: source.provenance, retrievalTimestamp: source.retrievedAt,
      sourceValidationStatus: "verified", observation: item.observation, timestamp: item.observedAt,
      affectedDomain: item.affectedDomain, evidenceReferences: [...item.evidenceReferences].sort(),
      confidenceClassification: item.evidenceReferences.length > 1 ? "HIGH" : "MEDIUM",
      classification: item.occurrenceCount > 1 ? "PATTERN" : "FACT",
    };
  });
}
