import type { DiscoveredSignal, DiscoveryProvenance } from "./governed-contracts";

export function provenanceFromSignal(signal: DiscoveredSignal): DiscoveryProvenance {
  return {
    sourceIdentity: signal.sourceIdentity,
    sourceOwnership: signal.sourceOwnership,
    sourceProvenance: signal.sourceProvenance,
    retrievalTimestamp: signal.retrievalTimestamp,
    validationStatus: signal.sourceValidationStatus,
    evidenceReferences: [...signal.evidenceReferences].sort(),
  };
}
