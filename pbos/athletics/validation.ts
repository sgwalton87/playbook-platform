import { digestValue, type PBOSRuntimeContext } from "../context";
import type { AthleticInput } from "./contracts";
import { AthleticError, athleticFailure } from "./errors";

function validContext(context: PBOSRuntimeContext): boolean {
  const body = { ...context };
  delete (body as Partial<PBOSRuntimeContext>).contextDigest;
  return context.documentInventory.length > 0 && context.contextDigest === digestValue(body);
}
export function validateAthleticInput(input: AthleticInput): PBOSRuntimeContext {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) throw new AthleticError([athleticFailure("INVALID_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  const owner = input.athleteIdentityDraft.ownerIdentity;
  if (!input.authorizedAthleteIdentities.includes(owner) || input.privacyBypassRequested) throw new AthleticError([athleticFailure("UNAUTHORIZED_ACCESS", "Athletic information requires athlete authorization.")]);
  if (input.fabricatedStatisticRequested) throw new AthleticError([athleticFailure("FABRICATED_STATISTIC", "Athletic statistics cannot be fabricated or altered.")]);
  if (input.falseOpportunityRequested) throw new AthleticError([athleticFailure("FALSE_OPPORTUNITY", "Athletic opportunities require verified provenance.")]);
  if (input.recruitingDecisionRequested) throw new AthleticError([athleticFailure("UNSUPPORTED_RECRUITING_DECISION", "PBOS cannot make recruiting, roster, admissions, contract, or employment decisions.")]);
  if (input.athleteRankingRequested) throw new AthleticError([athleticFailure("RANKING_PROHIBITED", "PBOS cannot rank athletes or calculate athlete value.")]);
  if (input.protectedCharacteristicInferenceRequested) throw new AthleticError([athleticFailure("INFERENCE_PROHIBITED", "PBOS cannot infer protected characteristics.")]);
  if (input.guaranteedOutcomeRequested) throw new AthleticError([athleticFailure("GUARANTEE_PROHIBITED", "Scholarships, contracts, roster positions, and mobility outcomes cannot be guaranteed.")]);
  if (Number.isNaN(Date.parse(input.generatedAt))) throw new AthleticError([athleticFailure("MISSING_EVIDENCE", "A valid report timestamp is required.")]);
  const digest = input.runtimeContext.contextDigest;
  const identity = input.identityReports.find(({ identityState }) => identityState.personReference === owner);
  const portfolio = input.portfolioReports.find(({ portfolioState }) => portfolioState.ownerIdentity === owner);
  if (!identity || identity.runtimeContextDigest !== digest || identity.ownershipInformation.ownerIdentity !== owner || !identity.ownershipInformation.personOwnsRecord || !portfolio || portfolio.runtimeContextDigest !== digest || !portfolio.portfolioState.personOwnsPortfolio) throw new AthleticError([athleticFailure("OWNERSHIP_VIOLATION", "Athlete-owned Identity and Portfolio intelligence are required.")]);
  if (!input.masteryReports.length || !input.credentialReports.length || !input.opportunityReports.length || !input.ecosystemReports.length ||
    input.masteryReports.some((report) => report.runtimeContextDigest !== digest || report.learnerId !== owner) ||
    input.credentialReports.some((report) => report.runtimeContextDigest !== digest || report.recipientIdentity !== owner) ||
    input.opportunityReports.some((report) => report.runtimeContextDigest !== digest) ||
    input.ecosystemReports.some((report) => report.runtimeContextDigest !== digest)) throw new AthleticError([athleticFailure("PRIVACY_VIOLATION", "Athletic intelligence inputs must match the athlete and active context.")]);
  if (!input.athleteIdentityDraft.permissions.length || !input.athleteIdentityDraft.sourceReference || !input.athleteIdentityDraft.evidenceReferences.length) throw new AthleticError([athleticFailure("MISSING_EVIDENCE", "Athlete identity requires explicit permissions and provenance.")]);
  const knownEvidence = new Set([
    ...identity.provenanceEvidence,
    ...portfolio.provenanceBundle.evidenceReferences,
    ...input.masteryReports.flatMap(({ evidenceBundle }) => evidenceBundle),
    ...input.credentialReports.flatMap(({ evidenceBundle }) => evidenceBundle),
    ...input.opportunityReports.flatMap(({ evidenceBundle }) => evidenceBundle),
    ...input.ecosystemReports.flatMap(({ evidenceBundle }) => evidenceBundle),
  ]);
  const referencedEvidence = [
    ...input.athleteIdentityDraft.evidenceReferences,
    ...input.athleticPortfolioDraft.evidenceReferences,
    ...input.performanceEvidenceDrafts.map(({ sourceReference }) => sourceReference),
    ...input.organizationDrafts.flatMap(({ evidenceReferences }) => evidenceReferences),
    ...input.recruitingOpportunityDrafts.flatMap(({ evidenceReferences }) => evidenceReferences),
    ...input.mobilityDrafts.flatMap(({ evidenceReferences }) => evidenceReferences),
    ...input.representationDrafts.flatMap(({ relationshipEvidenceReferences }) => relationshipEvidenceReferences),
    ...input.athletesAbroadProgramDrafts.flatMap(({ evidenceReferences, consentEvidenceReferences }) => [...evidenceReferences, ...consentEvidenceReferences]),
  ];
  if (!referencedEvidence.length || referencedEvidence.some((reference) => !knownEvidence.has(reference))) throw new AthleticError([athleticFailure("MISSING_EVIDENCE", "Every athletic artifact must cite authorized evidence provenance.")]);
  if (!input.performanceEvidenceDrafts.length || input.performanceEvidenceDrafts.some((evidence) => evidence.athleteOwnerIdentity !== owner || !evidence.event || !evidence.statistic || !evidence.sourceReference || !evidence.limitations.length || Number.isNaN(Date.parse(evidence.observedAt)) || (evidence.classification === "VERIFIED" && !evidence.verificationAuthority))) throw new AthleticError([athleticFailure("FABRICATED_STATISTIC", "Performance evidence requires athlete identity, event, statistic, source, timestamp, limitations, and authority when verified.")]);
  const supportedStatistics = new Set(input.performanceEvidenceDrafts.map(({ statistic }) => statistic));
  if (input.athleticPortfolioDraft.statistics.some((statistic) => !supportedStatistics.has(statistic))) throw new AthleticError([athleticFailure("FABRICATED_STATISTIC", "Every displayed statistic requires matching performance evidence.")]);
  const organizations = new Map(input.organizationDrafts.map((organization) => [organization.organizationIdentity, organization]));
  if (!input.organizationDrafts.length || input.organizationDrafts.some((organization) => organization.verificationStatus !== "VERIFIED" || !organization.ownership || !organization.evidenceReferences.length)) throw new AthleticError([athleticFailure("FALSE_OPPORTUNITY", "Athletic organizations require verified identity, ownership, and evidence.")]);
  if (input.recruitingOpportunityDrafts.some((opportunity) => opportunity.verificationStatus !== "VERIFIED" || !organizations.has(opportunity.organizationIdentity) || !knownEvidence.has(opportunity.sourceReference) || !organizations.get(opportunity.organizationIdentity)!.opportunitySourceReferences.includes(opportunity.sourceReference) || !opportunity.evidenceReferences.length)) throw new AthleticError([athleticFailure("FALSE_OPPORTUNITY", "Recruiting opportunities require a verified organization and source provenance.")]);
  if (input.mobilityDrafts.some((mobility) => !mobility.originLocation || !mobility.destinationLocation || !mobility.sportPathway || !mobility.eligibilityConsiderations.length || !mobility.documentationRequirements.length || !mobility.preparationNeeds.length || !mobility.transitionResources.length)) throw new AthleticError([athleticFailure("MISSING_EVIDENCE", "International mobility requires origins, destinations, eligibility considerations, documents, preparation, and resources.")]);
  const ecosystemEntities = new Set(input.ecosystemReports.flatMap(({ ecosystemEntities }) => ecosystemEntities.map(({ entityId }) => entityId)));
  const ecosystemRelationships = new Map(input.ecosystemReports.flatMap(({ relationships }) => relationships.map((relationship) => [relationship.relationshipId, relationship] as const)));
  if (input.representationDrafts.some((representation) => !ecosystemEntities.has(representation.representativeIdentity) || representation.identityVerificationStatus !== "VERIFIED" || representation.organizationVerificationStatus !== "VERIFIED" || !organizations.has(representation.organizationIdentity))) throw new AthleticError([athleticFailure("UNKNOWN_REPRESENTATIVE", "Representatives and their organizations require verified identity.")]);
  if (input.representationDrafts.some((representation) => { const relationship = ecosystemRelationships.get(representation.relationshipId); return !relationship || relationship.consentStatus !== "CONSENTED" || !representation.permissions.includes("REPRESENT") || !representation.relationshipEvidenceReferences.length || representation.relationshipEvidenceReferences.some((reference) => !relationship.evidenceReferences.includes(reference)); })) throw new AthleticError([athleticFailure("UNAUTHORIZED_REPRESENTATION", "Representation requires athlete consent, REPRESENT permission, and relationship evidence.")]);
  if (input.athletesAbroadProgramDrafts.some((program) => !organizations.has(program.partnerOrganizationIdentity) || !program.originCountries.length || !program.destinationCountries.length || !program.consentEvidenceReferences.length)) throw new AthleticError([athleticFailure("FALSE_OPPORTUNITY", "Athletes Abroad programs require a verified partner, international scope, and consent evidence.")]);
  return input.runtimeContext;
}
