import { digestValue } from "../context";
import type { AthleteIdentity, GlobalAthleteMobility, MobilityDraft } from "./contracts";
export function createMobilityPathways(drafts: MobilityDraft[], athlete: AthleteIdentity): GlobalAthleteMobility[] {
  return drafts.map((draft) => { const body = { ...draft, eligibilityConsiderations: [...draft.eligibilityConsiderations].sort(), documentationRequirements: [...draft.documentationRequirements].sort(), preparationNeeds: [...draft.preparationNeeds].sort(), transitionResources: [...draft.transitionResources].sort(), evidenceReferences: [...draft.evidenceReferences].sort(), athleteId: athlete.athleteId, outcomeGuaranteed: false as const, eligibilityDecisionMade: false as const }; return { mobilityId: `PBOS-ATH-MOB-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body }; }).sort((a, b) => a.mobilityId.localeCompare(b.mobilityId));
}
