import { digestValue } from "../context";
import type { AthleteIdentity, AthleticProvenance, PerformanceEvidence, PerformanceEvidenceDraft } from "./contracts";
export function createPerformanceEvidence(drafts: PerformanceEvidenceDraft[], athlete: AthleteIdentity, provenance: AthleticProvenance): PerformanceEvidence[] {
  return drafts.map((draft) => { const body = { ...draft, limitations: [...draft.limitations].sort(), athleteId: athlete.athleteId, isAthleteClaim: false as const, provenance: { ...provenance, sourceReferences: [draft.sourceReference], evidenceReferences: [draft.sourceReference] } }; return { evidenceId: `PBOS-ATH-EVID-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body }; }).sort((a, b) => a.evidenceId.localeCompare(b.evidenceId));
}
