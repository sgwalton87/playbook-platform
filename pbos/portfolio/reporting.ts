import { digestValue } from "../context";
import { createArtifacts } from "./artifacts";
import { connectCompetencies } from "./competencies";
import type { PortfolioInput, PortfolioProvenance, PortfolioRecord, PortfolioReport } from "./contracts";
import { createEvidence } from "./evidence";
import { createNarratives } from "./narratives";
import { createReflections } from "./reflections";
import { createSharingGrants, createShowcases } from "./sharing";
import { validatePortfolioInput } from "./validation";
export function createPortfolioReport(input: PortfolioInput): PortfolioReport {
  const context = validatePortfolioInput(input);
  const identity = input.identityReports.find(({ identityState }) => identityState.personReference === input.ownerIdentity)!;
  const sourceReportIds = [...input.identityReports.map(({ reportId }) => reportId), ...input.learningReports.map(({ reportId }) => reportId), ...input.masteryReports.map(({ reportId }) => reportId), ...input.credentialReports.map(({ reportId }) => reportId), ...input.opportunityReports.map(({ reportId }) => reportId)].sort();
  const provenance: PortfolioProvenance = { runtimeContextDigest: context.contextDigest, ownerIdentity: input.ownerIdentity, sourceReportIds, sourceReferences: [...new Set(input.evidenceDrafts.map(({ sourceReference }) => sourceReference))].sort(), evidenceReferences: [...new Set(input.evidenceDrafts.flatMap(({ sourceReference, supportingRecordIds }) => [sourceReference, ...supportingRecordIds]))].sort(), createdAt: input.generatedAt, authorizedActor: input.ownerIdentity };
  const evidence = createEvidence(input.evidenceDrafts, provenance);
  const artifacts = createArtifacts(input.artifactDrafts, evidence, provenance);
  const narrativeElements = createNarratives(input.narrativeDrafts, evidence);
  const sharingGrants = createSharingGrants(input.sharingDrafts, identity);
  const portfolioBody = { ownerIdentity: input.ownerIdentity, stewardIdentity: "PBOS" as const, purpose: input.purpose, visibility: input.requestedVisibility, artifactIds: artifacts.map(({ artifactId }) => artifactId).sort(), evidenceIds: evidence.map(({ evidenceId }) => evidenceId).sort(), competencies: [...new Set(artifacts.flatMap(({ relatedCompetencies }) => relatedCompetencies))].sort(), narrativeIds: narrativeElements.map(({ narrativeId }) => narrativeId).sort(), provenance, permissions: [...new Set(input.requestedPermissions)].sort(), personOwnsPortfolio: true as const };
  const portfolioState: PortfolioRecord = { portfolioId: `PBOS-PORT-${digestValue(portfolioBody).slice(0, 16).toUpperCase()}`, ...portfolioBody };
  const body = { generatedAt: input.generatedAt, runtimeContextDigest: context.contextDigest, portfolioState, artifacts, evidence, competencyConnections: connectCompetencies(artifacts, evidence), credentials: [...new Set(artifacts.flatMap(({ relatedCredentialIds }) => relatedCredentialIds))].sort(), reflections: createReflections(input.reflectionDrafts), narrativeElements, showcases: createShowcases(input.showcaseDrafts, artifacts), sharingGrants, permissions: [...new Set(input.requestedPermissions)].sort(), limitations: ["Portfolio evidence does not rank people or guarantee admission, employment, popularity, or future outcomes.", "PBOS organizes person-authored material but cannot replace personal voice or fabricate achievements."], provenanceBundle: provenance };
  return { reportId: `PBOS-PORT-REPORT-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
