import { digestValue, type PBOSRuntimeContext } from "../context";
import type { OpportunityInput } from "./contracts";
import { OpportunityError, opportunityFailure } from "./errors";

function validContext(context: PBOSRuntimeContext): boolean { const body = { ...context }; delete (body as Partial<PBOSRuntimeContext>).contextDigest; return context.documentInventory.length > 0 && context.contextDigest === digestValue(body); }
export function validateOpportunityInput(input: OpportunityInput): PBOSRuntimeContext {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) throw new OpportunityError([opportunityFailure("INVALID_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  if (!input.authorizedPersonIds.includes(input.personContext.personId)) throw new OpportunityError([opportunityFailure("PRIVACY_VIOLATION", "Opportunity alignment requires explicit person authorization.")]);
  if (input.fabricatedOpportunityRequested) throw new OpportunityError([opportunityFailure("FABRICATED_OPPORTUNITY", "Opportunities cannot be created without verified source evidence.")]);
  if (input.guaranteedOutcomeRequested) throw new OpportunityError([opportunityFailure("GUARANTEED_OUTCOME", "Opportunity relevance cannot guarantee success or acceptance.")]);
  if (input.unauthorizedDecisionRequested) throw new OpportunityError([opportunityFailure("UNAUTHORIZED_DECISION", "PBOS cannot admit, hire, select, deny access, or submit applications.")]);
  if (input.rankingRequested) throw new OpportunityError([opportunityFailure("RANKING_PROHIBITED", "People cannot be ranked by worth or opportunity alignment.")]);
  if (Number.isNaN(Date.parse(input.generatedAt))) throw new OpportunityError([opportunityFailure("MISSING_EVIDENCE", "A valid analysis timestamp is required.")]);
  const digest = input.runtimeContext.contextDigest;
  const identityMismatch = !input.credentialReports.length || !input.masteryReports.length || !input.learningReports.length || !input.discoveryReports.length || input.credentialReports.some((report) => report.runtimeContextDigest !== digest || report.recipientIdentity !== input.personContext.personId) || input.masteryReports.some((report) => report.runtimeContextDigest !== digest || report.learnerId !== input.personContext.personId) || input.learningReports.some((report) => report.runtimeContextDigest !== digest || report.learner.learnerId !== input.personContext.personId) || input.discoveryReports.some((report) => report.runtimeContextDigest !== digest);
  if (identityMismatch) throw new OpportunityError([opportunityFailure("PRIVACY_VIOLATION", "Credential, mastery, and learning inputs must match the authorized person and active context.")]);
  if (!input.organizationDrafts.length || input.organizationDrafts.some((organization) => organization.verificationStatus !== "VERIFIED" || !organization.authority.length || !organization.ownership || !organization.sourceReference || !organization.evidenceReferences.length)) throw new OpportunityError([opportunityFailure("UNKNOWN_ORGANIZATION", "Organizations require verified identity, authority, ownership, and provenance.")]);
  const organizationNames = new Set(input.organizationDrafts.map(({ name }) => name));
  if (input.opportunityDrafts.some((opportunity) => !organizationNames.has(opportunity.organizationName))) throw new OpportunityError([opportunityFailure("UNKNOWN_ORGANIZATION", "Every opportunity must reference a verified organization.")]);
  if (!input.opportunityDrafts.length || input.opportunityDrafts.some((opportunity) => opportunity.verificationStatus !== "VERIFIED" || !opportunity.sourceReference || !opportunity.sourceEvidence.length)) throw new OpportunityError([opportunityFailure("FABRICATED_OPPORTUNITY", "Opportunity source and evidence must be verified.")]);
  const discoveryEvidence = new Set(input.discoveryReports.flatMap((report) => report.evidenceBundle));
  if (input.organizationDrafts.some((organization) => organization.evidenceReferences.some((reference) => !discoveryEvidence.has(reference))) || input.opportunityDrafts.some((opportunity) => opportunity.sourceEvidence.some((reference) => !discoveryEvidence.has(reference)))) throw new OpportunityError([opportunityFailure("FABRICATED_OPPORTUNITY", "Organizations and opportunities may only cite validated discovery evidence.")]);
  if (input.opportunityDrafts.some((opportunity) => !opportunity.eligibilityCriteria.length || opportunity.eligibilityCriteria.some((criterion) => !criterion.description || !criterion.sourceReference || criterion.verificationStatus !== "VERIFIED"))) throw new OpportunityError([opportunityFailure("HIDDEN_CRITERIA", "Eligibility criteria must be complete, sourced, and visible.")]);
  if (input.opportunityDrafts.some((opportunity) => opportunity.deadlines.some((deadline) => Number.isNaN(Date.parse(deadline.date)) || !deadline.sourceReference || deadline.verificationStatus !== "VERIFIED"))) throw new OpportunityError([opportunityFailure("MISSING_EVIDENCE", "Deadlines require verified source and date provenance.")]);
  const personEvidence = new Set(input.personContext.evidenceReferences);
  const unsupportedAssertion = input.eligibilityAssertions.some((assertion) => {
    const opportunity = input.opportunityDrafts.find((draft) => draft.sourceReference === assertion.opportunitySourceReference);
    return !opportunity || (assertion.assertedStatus === "MEETS_REQUIREMENTS" && opportunity.eligibilityCriteria.some((criterion) => !criterion.requiredEvidence.length || criterion.requiredEvidence.some((evidence) => !personEvidence.has(evidence))));
  });
  if (unsupportedAssertion) throw new OpportunityError([opportunityFailure("UNSUPPORTED_ELIGIBILITY", "Eligibility assertions require evidence for every disclosed criterion.")]);
  return input.runtimeContext;
}
