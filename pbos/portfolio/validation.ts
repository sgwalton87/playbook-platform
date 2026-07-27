import { digestValue, type PBOSRuntimeContext } from "../context";
import type { IdentityReport } from "../identity";
import type { PortfolioInput } from "./contracts";
import { PortfolioError, portfolioFailure } from "./errors";

function validContext(context: PBOSRuntimeContext): boolean {
  const body = { ...context };
  delete (body as Partial<PBOSRuntimeContext>).contextDigest;
  return context.documentInventory.length > 0 && context.contextDigest === digestValue(body);
}
function ownerIdentityReport(input: PortfolioInput): IdentityReport | undefined {
  return input.identityReports.find(({ identityState }) => identityState.personReference === input.ownerIdentity);
}
export function validatePortfolioInput(input: PortfolioInput): PBOSRuntimeContext {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) throw new PortfolioError([portfolioFailure("INVALID_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  if (!input.authorizedOwnerIdentities.includes(input.ownerIdentity) || input.ownershipBypassRequested) throw new PortfolioError([portfolioFailure("OWNERSHIP_VIOLATION", "The person must own and authorize the portfolio.")]);
  if (input.fabricatedArtifactRequested) throw new PortfolioError([portfolioFailure("FABRICATED_ARTIFACT", "Portfolio artifacts cannot be fabricated.")]);
  if (input.falseAchievementRequested) throw new PortfolioError([portfolioFailure("FALSE_ACHIEVEMENT", "Achievements require authentic, supported evidence.")]);
  if (input.alteredEvidenceRequested) throw new PortfolioError([portfolioFailure("ALTERED_EVIDENCE", "Source evidence cannot be altered.")]);
  if (input.portfolioRankingRequested) throw new PortfolioError([portfolioFailure("RANKING_PROHIBITED", "Portfolios cannot be ranked by PBOS.")]);
  if (input.protectedCharacteristicInferenceRequested) throw new PortfolioError([portfolioFailure("INFERENCE_PROHIBITED", "Portfolio evidence cannot infer protected characteristics.")]);
  if (input.guaranteedOutcomeRequested) throw new PortfolioError([portfolioFailure("GUARANTEE_PROHIBITED", "A portfolio cannot guarantee admission, employment, or any outcome.")]);
  if (Number.isNaN(Date.parse(input.generatedAt))) throw new PortfolioError([portfolioFailure("MISSING_EVIDENCE", "A valid report timestamp is required.")]);
  const digest = input.runtimeContext.contextDigest;
  const identity = ownerIdentityReport(input);
  if (!identity || identity.runtimeContextDigest !== digest || identity.ownershipInformation.ownerIdentity !== input.ownerIdentity || !identity.ownershipInformation.personOwnsRecord) throw new PortfolioError([portfolioFailure("OWNERSHIP_VIOLATION", "A person-owned Identity report is required.")]);
  if (!input.learningReports.length || !input.masteryReports.length || !input.credentialReports.length || !input.opportunityReports.length ||
    input.learningReports.some((report) => report.runtimeContextDigest !== digest || report.learner.learnerId !== input.ownerIdentity) ||
    input.masteryReports.some((report) => report.runtimeContextDigest !== digest || report.learnerId !== input.ownerIdentity) ||
    input.credentialReports.some((report) => report.runtimeContextDigest !== digest || report.recipientIdentity !== input.ownerIdentity) ||
    input.opportunityReports.some((report) => report.runtimeContextDigest !== digest)) throw new PortfolioError([portfolioFailure("PRIVACY_VIOLATION", "Portfolio intelligence inputs must match the owner and active context.")]);
  if (!input.requestedPermissions.length || input.artifactDrafts.some(({ permissions }) => !permissions.length || permissions.some((permission) => !input.requestedPermissions.includes(permission)))) throw new PortfolioError([portfolioFailure("OWNERSHIP_VIOLATION", "Artifact permissions must be explicitly granted by the owner.")]);
  const availableEvidence = new Set([...identity.provenanceEvidence, ...input.learningReports.flatMap(({ evidenceBundle }) => evidenceBundle), ...input.masteryReports.flatMap(({ evidenceBundle }) => evidenceBundle), ...input.credentialReports.flatMap(({ evidenceBundle }) => evidenceBundle), ...input.opportunityReports.flatMap(({ evidenceBundle }) => evidenceBundle)]);
  const sourceReportIds = new Set([...input.identityReports, ...input.learningReports, ...input.masteryReports, ...input.credentialReports, ...input.opportunityReports].map(({ reportId }) => reportId));
  if (!input.evidenceDrafts.length || input.evidenceDrafts.some((evidence) => !availableEvidence.has(evidence.sourceReference) || !evidence.supportingRecordIds.length || evidence.supportingRecordIds.some((recordId) => !sourceReportIds.has(recordId)) || !evidence.limitations.length || Number.isNaN(Date.parse(evidence.observedAt)) || (evidence.classification === "VERIFIED" && !evidence.verificationAuthority))) throw new PortfolioError([portfolioFailure("MISSING_EVIDENCE", "Evidence requires a traceable source, supporting records, timestamp, limitations, and verification authority when verified.")]);
  const evidenceSources = new Set(input.evidenceDrafts.map(({ sourceReference }) => sourceReference));
  if (!input.artifactDrafts.length || input.artifactDrafts.some((artifact) => artifact.ownerIdentity !== input.ownerIdentity || !artifact.sourceReference || !artifact.evidenceSourceReferences.length || artifact.evidenceSourceReferences.some((reference) => !evidenceSources.has(reference)) || Number.isNaN(Date.parse(artifact.createdAt)))) throw new PortfolioError([portfolioFailure("FABRICATED_ARTIFACT", "Artifacts require owner identity, provenance, creation date, and supporting evidence.")]);
  const artifactTitles = new Set(input.artifactDrafts.map(({ title }) => title));
  const supportedCompetencies = new Set(input.masteryReports.flatMap(({ competencies }) => competencies.map(({ competencyName }) => competencyName)));
  if (input.artifactDrafts.some(({ relatedCompetencies }) => relatedCompetencies.some((competency) => !supportedCompetencies.has(competency)))) throw new PortfolioError([portfolioFailure("MISSING_EVIDENCE", "Competency connections require a supported Mastery competency.")]);
  if (input.artifactDrafts.some((artifact) => artifact.artifactType === "ACHIEVEMENT" && artifact.evidenceSourceReferences.some((source) => input.evidenceDrafts.find((evidence) => evidence.sourceReference === source)?.classification !== "VERIFIED"))) throw new PortfolioError([portfolioFailure("FALSE_ACHIEVEMENT", "Achievement artifacts require verified evidence.")]);
  if (input.reflectionDrafts.some((reflection) => reflection.authorIdentity !== input.ownerIdentity || !reflection.reflectionText || Number.isNaN(Date.parse(reflection.reflectedAt)))) throw new PortfolioError([portfolioFailure("PERSONAL_VOICE_VIOLATION", "Reflections must be authored by the owner and preserve their text.")]);
  if (input.narrativeDrafts.some((narrative) => narrative.authorIdentity !== input.ownerIdentity || !narrative.personalVoiceConfirmed || !narrative.storySections.length || narrative.evidenceSourceReferences.some((reference) => !evidenceSources.has(reference)) || narrative.achievementArtifactTitles.some((title) => !artifactTitles.has(title)))) throw new PortfolioError([portfolioFailure("PERSONAL_VOICE_VIOLATION", "Narratives require authentic personal voice and supported portfolio references.")]);
  const now = Date.parse(input.generatedAt);
  for (const sharing of input.sharingDrafts) {
    const consent = identity.consentHistory.find((candidate) => candidate.status === "GRANTED" && candidate.authorizedRecipient === sharing.recipient && candidate.purpose === sharing.purpose && (!candidate.expiresAt || Date.parse(candidate.expiresAt) > now) && sharing.dataCategories.every((category) => candidate.dataCategories.includes(category)) && sharing.consentEvidenceReferences.every((reference) => candidate.evidenceReferences.includes(reference)));
    if (sharing.ownerIdentity !== input.ownerIdentity || !sharing.ownerApproved || !consent || Number.isNaN(Date.parse(sharing.expiresAt)) || Date.parse(sharing.expiresAt) <= now || !sharing.consentEvidenceReferences.length) throw new PortfolioError([portfolioFailure("UNAUTHORIZED_SHARING", "Sharing requires active owner approval, matching consent, evidence, recipient, purpose, categories, and expiration.")]);
  }
  if (input.requestedVisibility !== "PRIVATE" && !input.sharingDrafts.length) throw new PortfolioError([portfolioFailure("UNAUTHORIZED_SHARING", "Portfolio visibility defaults to private unless sharing is authorized.")]);
  if (input.showcaseDrafts.some((showcase) => showcase.ownerIdentity !== input.ownerIdentity || showcase.selectedArtifactTitles.some((title) => !artifactTitles.has(title)) || (showcase.sharingStatus === "AUTHORIZED" && !input.sharingDrafts.some(({ recipient, purpose }) => recipient === showcase.audience && purpose === showcase.purpose)))) throw new PortfolioError([portfolioFailure("UNAUTHORIZED_SHARING", "Showcases require owner selection and matching sharing authorization.")]);
  return input.runtimeContext;
}
