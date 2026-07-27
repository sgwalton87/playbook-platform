import { digestValue } from "../context";
import type { AthleteIdentity, AthleteRepresentation, RepresentationDraft } from "./contracts";
export function createRepresentations(drafts: RepresentationDraft[], athlete: AthleteIdentity): AthleteRepresentation[] {
  return drafts.map((draft) => { const body = { ...draft, permissions: [...draft.permissions].sort(), relationshipEvidenceReferences: [...draft.relationshipEvidenceReferences].sort(), athleteId: athlete.athleteId, athleteConsentVerified: true as const, decisionAuthority: false as const }; return { representationId: `PBOS-ATH-REP-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body }; }).sort((a, b) => a.representationId.localeCompare(b.representationId));
}
