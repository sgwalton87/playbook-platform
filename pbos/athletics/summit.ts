import { digestValue } from "../context";
import type { AthletesAbroadProgram, AthletesAbroadProgramDraft } from "./contracts";
export function createAthletesAbroadPrograms(drafts: AthletesAbroadProgramDraft[]): AthletesAbroadProgram[] {
  return drafts.map((draft) => { const body = { ...draft, originCountries: [...draft.originCountries].sort(), destinationCountries: [...draft.destinationCountries].sort(), consentEvidenceReferences: [...draft.consentEvidenceReferences].sort(), evidenceReferences: [...draft.evidenceReferences].sort(), verifiedPartner: true as const, athleteOwnershipPreserved: true as const, connectionCreated: false as const }; return { programId: `PBOS-ATH-ABROAD-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body }; }).sort((a, b) => a.programId.localeCompare(b.programId));
}
