import { digestValue } from "../context";
import type { AthleteIdentity, AthleteIdentityDraft, AthleticProfile, AthleticPortfolioDraft, AthleticProvenance } from "./contracts";
export function createAthleteIdentity(draft: AthleteIdentityDraft, provenance: AthleticProvenance): AthleteIdentity {
  const body = { ...draft, positions: [...draft.positions].sort(), goals: [...draft.goals].sort(), locationPreferences: [...draft.locationPreferences].sort(), opportunityPreferences: [...draft.opportunityPreferences].sort(), permissions: [...draft.permissions].sort(), evidenceReferences: [...draft.evidenceReferences].sort(), ownershipStatus: "ATHLETE_OWNED_PBOS_STEWARD" as const, provenance };
  return { athleteId: `PBOS-ATH-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
export function createAthleticProfile(draft: AthleticPortfolioDraft, athlete: AthleteIdentity, provenance: AthleticProvenance): AthleticProfile {
  const body = { ...draft, sportHistory: [...draft.sportHistory].sort(), teams: [...draft.teams].sort(), seasons: [...draft.seasons].sort(), statistics: [...draft.statistics].sort(), awards: [...draft.awards].sort(), achievements: [...draft.achievements].sort(), videoReferences: [...draft.videoReferences].sort(), academicInformation: [...draft.academicInformation].sort(), leadershipExperiences: [...draft.leadershipExperiences].sort(), communityInvolvement: [...draft.communityInvolvement].sort(), careerInterests: [...draft.careerInterests].sort(), evidenceReferences: [...draft.evidenceReferences].sort(), athleteId: athlete.athleteId, provenance };
  return { profileId: `PBOS-ATH-PROFILE-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
