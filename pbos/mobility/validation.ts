import { digestValue, type PBOSRuntimeContext } from "../context";
import type { MobilityInput } from "./contracts";
import { MobilityError, mobilityFailure } from "./errors";
function validContext(context: PBOSRuntimeContext): boolean { const body = { ...context }; delete (body as Partial<PBOSRuntimeContext>).contextDigest; return context.documentInventory.length > 0 && context.contextDigest === digestValue(body); }
function fail(code: Parameters<typeof mobilityFailure>[0], message: string): never { throw new MobilityError([mobilityFailure(code, message)]); }
export function validateMobilityInput(input: MobilityInput): PBOSRuntimeContext {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) fail("INVALID_CONTEXT", "A valid Runtime Context is required."); const context = input.runtimeContext as PBOSRuntimeContext;
  if (input.guaranteedOutcomeRequested) fail("GUARANTEED_OUTCOME", "Mobility cannot guarantee placement or success.");
  if (input.fabricatedPathwayRequested) fail("FABRICATED_DESTINATION", "Fabricated pathways and destinations are prohibited.");
  if (input.recruitingDecisionRequested) fail("RECRUITING_DECISION_PROHIBITED", "PBOS cannot make recruiting decisions.");
  if (input.admissionsDecisionRequested) fail("ADMISSIONS_DECISION_PROHIBITED", "PBOS cannot make admissions decisions.");
  if (input.employmentDecisionRequested) fail("EMPLOYMENT_DECISION_PROHIBITED", "PBOS cannot make employment decisions.");
  if (input.legalDeterminationRequested) fail("LEGAL_DETERMINATION_PROHIBITED", "PBOS does not provide immigration or legal determinations.");
  if (input.rankingRequested) fail("RANKING_PROHIBITED", "People cannot be ranked for mobility.");
  if (input.privacyBypassRequested) fail("PRIVACY_VIOLATION", "Mobility cannot bypass privacy or consent.");
  if (!input.journeyDrafts.length || Number.isNaN(Date.parse(input.generatedAt))) fail("MISSING_EVIDENCE", "A journey and valid timestamp are required.");
  const reports = [...input.identityReports, ...input.academicReports, ...input.athleticReports, ...input.portfolioReports, ...input.opportunityReports, ...input.ecosystemReports, ...input.communicationReports];
  if (reports.some((report) => report.runtimeContextDigest !== context.contextDigest)) fail("PRIVACY_VIOLATION", "All source reports must share the active Runtime Context.");
  const evidence = new Set([...input.identityReports.flatMap((r) => r.provenanceEvidence), ...input.academicReports.flatMap((r) => r.evidence), ...input.athleticReports.flatMap((r) => r.provenanceBundle.evidenceReferences), ...input.portfolioReports.flatMap((r) => r.provenanceBundle.evidenceReferences), ...input.opportunityReports.flatMap((r) => r.evidenceBundle), ...input.ecosystemReports.flatMap((r) => r.evidenceBundle), ...input.communicationReports.flatMap((r) => r.evidenceBundle)]);
  const requirements = new Map(input.requirements.map((requirement) => [requirement.requirementId, requirement])); const documents = new Set(input.documents.map(({ documentId }) => documentId));
  const relationships = new Map(input.ecosystemReports.flatMap((report) => report.relationships.map((relationship) => [relationship.relationshipId, relationship] as const))); const messages = new Set(input.communicationReports.flatMap((report) => report.messages.map(({ messageId }) => messageId)));
  const opportunities = new Set(input.opportunityReports.flatMap((report) => report.opportunityInventory.map(({ opportunityId }) => opportunityId)));
  for (const journey of input.journeyDrafts) {
    const identity = input.identityReports.find((report) => report.identityState.personReference === journey.personIdentity);
    if (!input.authorizedPersonIdentities.includes(journey.personIdentity) || !identity || identity.ownershipInformation.ownerIdentity !== journey.personIdentity) fail("UNAUTHORIZED_ACCESS", "Mobility journeys require authorized, person-owned identity.");
    if (!journey.origin.verified || !journey.destination.verified || !journey.origin.sourceAuthority || !journey.destination.sourceAuthority) fail("FABRICATED_DESTINATION", "Origins and destinations require verified source authority.");
    if (!journey.goal || Number.isNaN(Date.parse(journey.timeline.startsAt)) || Number.isNaN(Date.parse(journey.timeline.targetAt)) || Date.parse(journey.timeline.targetAt) <= Date.parse(journey.timeline.startsAt)) fail("UNSUPPORTED_TRANSITION", "Journeys require a goal and valid forward timeline.");
    if (!journey.evidenceReferences.length || journey.evidenceReferences.some((reference) => !evidence.has(reference))) fail("MISSING_EVIDENCE", "Journey evidence must be traceable.");
    if (journey.requirementIds.some((id) => !requirements.has(id)) || journey.documentIds.some((id) => !documents.has(id)) || journey.opportunityIds.some((id) => !opportunities.has(id))) fail("UNSUPPORTED_TRANSITION", "Requirements, documents, and opportunities must be verified inputs.");
    if (journey.transition.preparationActivities.some(({ classification }) => !["POSSIBLE_NEXT_STEP", "RECOMMENDATION", "FACT"].includes(classification)) || journey.transition.possibleBarriers.some(({ classification }) => classification !== "INFORMATION_GAP")) fail("UNSUPPORTED_TRANSITION", "Transition statements must preserve fact, gap, and advisory classifications.");
    for (const relationshipId of journey.supportRelationshipIds) { const support = input.supports.find((item) => item.relationshipId === relationshipId); const relationship = relationships.get(relationshipId); if (!support || !relationship || relationship.consentStatus !== "CONSENTED" || relationship.status !== "ACTIVE" || !support.permissions.includes("CONNECT") || !messages.has(support.communicationMessageId) || !support.evidenceReferences.length) fail("INVALID_SUPPORT", "Support requires a consented relationship, permission, evidence, and authorized communication."); }
  }
  for (const requirement of input.requirements) if (!requirement.sourceAuthority || !requirement.evidenceReferences.length || requirement.legalDetermination) fail("MISSING_EVIDENCE", "Requirements require authority, evidence, and no legal determination.");
  return context;
}
