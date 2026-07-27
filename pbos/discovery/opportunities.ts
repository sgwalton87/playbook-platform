import { digestValue } from "../context";
import type { DiscoveredSignal, DiscoveryOpportunity, OpportunityInput } from "./governed-contracts";
import { provenanceFromSignal } from "./provenance";
import { requiredDiscoveryApprovals } from "./routing";

export function createOpportunity(signal: DiscoveredSignal, input: OpportunityInput): DiscoveryOpportunity {
  const body = { discoveredSignal: signal.signalId, supportingEvidence: [...signal.evidenceReferences].sort(), provenance: provenanceFromSignal(signal), ...input, requiredApprovals: requiredDiscoveryApprovals(input.changeType), advisoryOnly: true as const };
  return { opportunityId: `PBOS-DISC-OPP-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
