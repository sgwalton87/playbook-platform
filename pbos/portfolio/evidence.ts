import { digestValue } from "../context";
import type { EvidenceDraft, PortfolioEvidence, PortfolioProvenance } from "./contracts";
export function createEvidence(drafts: EvidenceDraft[], provenance: PortfolioProvenance): PortfolioEvidence[] {
  return drafts.map((draft) => {
    const body = { ...draft, supportingRecordIds: [...draft.supportingRecordIds].sort(), limitations: [...draft.limitations].sort(), isClaim: false as const, provenance: { ...provenance, sourceReferences: [draft.sourceReference], evidenceReferences: [draft.sourceReference] } };
    return { evidenceId: `PBOS-PORT-EVID-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
  }).sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));
}
