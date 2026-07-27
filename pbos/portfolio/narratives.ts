import { digestValue } from "../context";
import type { NarrativeDraft, PortfolioEvidence, PortfolioNarrative } from "./contracts";
export function createNarratives(drafts: NarrativeDraft[], evidence: PortfolioEvidence[]): PortfolioNarrative[] {
  const evidenceBySource = new Map(evidence.map((item) => [item.sourceReference, item.evidenceId]));
  return drafts.map(({ evidenceSourceReferences, personalVoiceConfirmed, ...draft }) => { void personalVoiceConfirmed; const body = { ...draft, storySections: [...draft.storySections], experienceReferences: [...draft.experienceReferences].sort(), achievementArtifactTitles: [...draft.achievementArtifactTitles].sort(), goals: [...draft.goals], values: [...draft.values], evidenceIds: evidenceSourceReferences.map((reference) => evidenceBySource.get(reference)!).sort(), voiceStandard: "AUTHENTIC_PERSONAL_VOICE" as const, personAuthored: true as const, fabricatedContent: false as const }; return { narrativeId: `PBOS-PORT-NARR-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body }; }).sort((a, b) => a.narrativeId.localeCompare(b.narrativeId));
}
