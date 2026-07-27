import { digestValue } from "../context";
import type { ArtifactDraft, PortfolioArtifact, PortfolioEvidence, PortfolioProvenance } from "./contracts";
export function createArtifacts(drafts: ArtifactDraft[], evidence: PortfolioEvidence[], provenance: PortfolioProvenance): PortfolioArtifact[] {
  const evidenceBySource = new Map(evidence.map((item) => [item.sourceReference, item.evidenceId]));
  return drafts.map((draft) => {
    const { evidenceSourceReferences, ...rest } = draft;
    const body = { ...rest, relatedCompetencies: [...rest.relatedCompetencies].sort(), relatedCredentialIds: [...rest.relatedCredentialIds].sort(), permissions: [...rest.permissions].sort(), evidenceIds: evidenceSourceReferences.map((reference) => evidenceBySource.get(reference)!).sort(), provenance: { ...provenance, sourceReferences: [draft.sourceReference], evidenceReferences: [...evidenceSourceReferences].sort() } };
    return { artifactId: `PBOS-PORT-ART-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
  }).sort((a, b) => a.artifactId.localeCompare(b.artifactId));
}
