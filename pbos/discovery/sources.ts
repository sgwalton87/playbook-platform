import { digestValue, type PBOSRuntimeContext } from "../context";
import type { ApprovedDiscoverySource, DiscoveryInput } from "./governed-contracts";
import { DiscoveryError, discoveryFailure } from "./errors";

function expectedDigest(context: PBOSRuntimeContext): string {
  const input = { ...context };
  delete (input as Partial<PBOSRuntimeContext>).contextDigest;
  return digestValue(input);
}

export function validateDiscoveryInput(input: DiscoveryInput): ApprovedDiscoverySource[] {
  const context = input.runtimeContext;
  if (!context || !context.documentInventory.length || context.contextDigest !== expectedDigest(context)) throw new DiscoveryError([discoveryFailure("MISSING_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  if (input.unsupportedConclusionRequested) throw new DiscoveryError([discoveryFailure("UNSUPPORTED_CONCLUSION", "Observations cannot be promoted into unsupported conclusions.")]);
  if (input.unauthorizedDecisionRequested) throw new DiscoveryError([discoveryFailure("UNAUTHORIZED_DECISION", "Discovery outputs are advisory and cannot make decisions.")]);
  if (!input.sources.length || input.sources.some((source) => source.validationStatus !== "verified")) throw new DiscoveryError([discoveryFailure("INVALID_SOURCE", "All discovery sources must be approved and verified.")]);
  if (new Set(input.sources.map(({ identifier }) => identifier)).size !== input.sources.length) throw new DiscoveryError([discoveryFailure("INVALID_SOURCE", "Discovery source identities must be unique.")]);
  if (input.sources.some((source) => !source.identifier || !source.owner || !source.provenance || !source.evidenceReferences.length || !source.approvedDomains.length || Number.isNaN(Date.parse(source.retrievedAt)))) throw new DiscoveryError([discoveryFailure("MISSING_PROVENANCE", "Every source requires identity, ownership, provenance, timestamp, domain approval, and evidence.")]);
  if (Number.isNaN(Date.parse(input.observationTimestamp))) throw new DiscoveryError([discoveryFailure("INVALID_EVIDENCE", "Observation timestamp is invalid.")]);
  const sources = new Map(input.sources.map((source) => [source.identifier, source]));
  if (input.observations.some((item) => !sources.has(item.sourceIdentifier) || !item.observation || !item.evidenceReferences.length || item.occurrenceCount < 1 || Number.isNaN(Date.parse(item.observedAt)))) throw new DiscoveryError([discoveryFailure("INVALID_EVIDENCE", "Every observation requires a verified source, timestamp, occurrence count, and evidence.")]);
  if (input.observations.some((item) => !sources.get(item.sourceIdentifier)?.approvedDomains.includes(item.affectedDomain))) throw new DiscoveryError([discoveryFailure("INVALID_SOURCE", "A source may only support signals in its approved domains.")]);
  if (input.informationGaps.some((gap) => !gap.description || !gap.evidenceReferences.length)) throw new DiscoveryError([discoveryFailure("INVALID_EVIDENCE", "Information gaps must be evidence-backed and must not treat absence as proof.")]);
  return [...input.sources].sort((a, b) => a.identifier.localeCompare(b.identifier));
}
