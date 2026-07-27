import { digestValue } from "../context";
import type { IdentityReport } from "../identity";
import type { PortfolioArtifact, PortfolioSharingGrant, PortfolioShowcase, SharingDraft, ShowcaseDraft } from "./contracts";
export function createSharingGrants(drafts: SharingDraft[], identity: IdentityReport): PortfolioSharingGrant[] {
  return drafts.map((draft) => { const consent = identity.consentHistory.find((candidate) => candidate.authorizedRecipient === draft.recipient && candidate.purpose === draft.purpose && candidate.status === "GRANTED")!; const body = { ...draft, dataCategories: [...draft.dataCategories].sort(), consentEvidenceReferences: [...draft.consentEvidenceReferences].sort(), consentId: consent.consentId, active: true as const }; return { sharingId: `PBOS-PORT-SHARE-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body }; }).sort((a, b) => a.sharingId.localeCompare(b.sharingId));
}
export function createShowcases(drafts: ShowcaseDraft[], artifacts: PortfolioArtifact[]): PortfolioShowcase[] {
  const artifactByTitle = new Map(artifacts.map((artifact) => [artifact.title, artifact.artifactId]));
  return drafts.map(({ selectedArtifactTitles, ...draft }) => { const body = { ...draft, permissions: [...draft.permissions].sort(), selectedArtifactIds: selectedArtifactTitles.map((title) => artifactByTitle.get(title)!).sort(), defaultVisibility: "PRIVATE" as const }; return { showcaseId: `PBOS-PORT-SHOW-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body }; }).sort((a, b) => a.showcaseId.localeCompare(b.showcaseId));
}
