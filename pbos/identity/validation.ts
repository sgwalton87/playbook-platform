import { digestValue, type PBOSRuntimeContext } from "../context";
import type { ConsentDraft, IdentityInput, PrivacyClassification } from "./contracts";
import { IdentityError, identityFailure } from "./errors";

const privacyWeight: Record<PrivacyClassification, number> = { PUBLIC: 0, SHARED: 1, PRIVATE: 2, RESTRICTED: 3, SENSITIVE: 4 };
function validContext(context: PBOSRuntimeContext): boolean {
  const body = { ...context };
  delete (body as Partial<PBOSRuntimeContext>).contextDigest;
  return context.documentInventory.length > 0 && context.contextDigest === digestValue(body);
}
function activeConsent(consent: ConsentDraft, generatedAt: string): boolean {
  return consent.status === "GRANTED" && (!consent.expiresAt || Date.parse(consent.expiresAt) > Date.parse(generatedAt));
}

export function validateIdentityInput(input: IdentityInput): PBOSRuntimeContext {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) throw new IdentityError([identityFailure("INVALID_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  const person = input.identityData.personReference;
  if (!input.authorizedPersonReferences.includes(person)) throw new IdentityError([identityFailure("UNAUTHORIZED_ACCESS", "Identity data requires authorization from the person.")]);
  if (input.ownershipBypassRequested) throw new IdentityError([identityFailure("OWNERSHIP_BYPASS", "PBOS is an identity steward and cannot bypass person ownership.")]);
  if (input.falseIdentityClaimRequested) throw new IdentityError([identityFailure("FALSE_IDENTITY", "Unverified or false identity claims are prohibited.")]);
  if (input.identityRankingRequested) throw new IdentityError([identityFailure("RANKING_PROHIBITED", "Identity information cannot be used to rank people.")]);
  if (input.protectedCharacteristicInferenceRequested || input.identityData.attributes.some(({ informationClass }) => informationClass === "INFERRED_INFORMATION")) throw new IdentityError([identityFailure("INFERENCE_PROHIBITED", "PBOS cannot infer identity or protected attributes.")]);
  if (input.dataSaleRequested) throw new IdentityError([identityFailure("DATA_SALE_PROHIBITED", "PBOS cannot sell identity data.")]);
  if (Number.isNaN(Date.parse(input.generatedAt))) throw new IdentityError([identityFailure("MISSING_PROVENANCE", "A valid report timestamp is required.")]);
  const digest = input.runtimeContext.contextDigest;
  if (!input.ecosystemReports.length || !input.credentialReports.length || !input.learningReports.length || !input.masteryReports.length ||
    input.ecosystemReports.some((report) => report.runtimeContextDigest !== digest) ||
    input.credentialReports.some((report) => report.runtimeContextDigest !== digest || report.recipientIdentity !== person) ||
    input.learningReports.some((report) => report.runtimeContextDigest !== digest || report.learner.learnerId !== person) ||
    input.masteryReports.some((report) => report.runtimeContextDigest !== digest || report.learnerId !== person)) {
    throw new IdentityError([identityFailure("PRIVACY_VIOLATION", "Identity intelligence inputs must match the person and active context.")]);
  }
  const knownEvidence = new Set([
    ...input.identityData.evidenceReferences,
    ...input.ecosystemReports.flatMap(({ evidenceBundle }) => evidenceBundle),
    ...input.credentialReports.flatMap(({ evidenceBundle }) => evidenceBundle),
    ...input.learningReports.flatMap(({ evidenceBundle }) => evidenceBundle),
    ...input.masteryReports.flatMap(({ evidenceBundle }) => evidenceBundle),
  ]);
  const referenced = [
    ...input.identityData.attributes.flatMap(({ evidenceReferences }) => evidenceReferences),
    ...input.consentDrafts.flatMap(({ evidenceReferences }) => evidenceReferences),
    ...input.verificationDrafts.flatMap(({ evidenceReferences }) => evidenceReferences),
    ...input.portabilityRequests.flatMap(({ consentEvidenceReferences }) => consentEvidenceReferences),
    ...input.modificationHistory.flatMap(({ evidenceReferences }) => evidenceReferences),
  ];
  if (!referenced.length || referenced.some((reference) => !knownEvidence.has(reference))) throw new IdentityError([identityFailure("MISSING_PROVENANCE", "Every identity artifact requires authorized evidence provenance.")]);
  if (input.identityData.attributes.some((attribute) => !attribute.sourceReference || !attribute.evidenceReferences.length || (attribute.informationClass === "IDENTITY_FACT" && !attribute.verified))) throw new IdentityError([identityFailure("FALSE_IDENTITY", "Identity facts require verified source evidence; user-provided information remains explicitly classified.")]);
  if (input.verificationDrafts.some((verification) => verification.personReference !== person || verification.status !== "VERIFIED" || !verification.verificationAuthority || !verification.verificationMethod || !verification.evidenceReferences.length || Number.isNaN(Date.parse(verification.verifiedAt)))) throw new IdentityError([identityFailure("INVALID_VERIFICATION", "Identity verification requires human authority, method, timestamp, evidence, and verified status.")]);
  if (input.consentDrafts.some((consent) => !consent.evidenceReferences.length || (consent.status === "GRANTED" && (!consent.grantedAt || Number.isNaN(Date.parse(consent.grantedAt)))))) throw new IdentityError([identityFailure("MISSING_CONSENT", "Granted consent requires evidence and a valid grant timestamp.")]);
  const consent = input.consentDrafts.find((candidate) => candidate.personReference === person && candidate.authorizedRecipient === input.accessRequester && candidate.purpose === input.accessPurpose && activeConsent(candidate, input.generatedAt) && input.requestedDataCategories.every((category) => candidate.dataCategories.includes(category)));
  if (!consent) throw new IdentityError([identityFailure("MISSING_CONSENT", "No active, purpose-specific consent authorizes the requested identity access.")]);
  if (!input.requestedPermissions.length || input.requestedPermissions.some((permission) => !input.identityData.requestedPermissions.includes(permission))) throw new IdentityError([identityFailure("UNAUTHORIZED_ACCESS", "Requested identity permissions must be explicit.")]);
  const requestedAttributes = input.identityData.attributes.filter(({ name }) => input.requestedDataCategories.includes(name));
  if (requestedAttributes.some(({ privacy }) => privacyWeight[privacy] >= privacyWeight.RESTRICTED && input.accessRequester !== person)) throw new IdentityError([identityFailure("PRIVACY_VIOLATION", "Restricted or sensitive identity information cannot be shared with an external recipient.")]);
  if (input.modificationHistory.some((modification) => modification.authorizedActor !== person || modification.permission !== "EDIT")) throw new IdentityError([identityFailure("OWNERSHIP_BYPASS", "Identity modifications require owner authorization and EDIT permission.")]);
  if (input.portabilityRequests.some((request) => request.personReference !== person || !request.permissions.includes("EXPORT") || !request.consentEvidenceReferences.length)) throw new IdentityError([identityFailure("UNAUTHORIZED_ACCESS", "Identity portability requires a person-controlled EXPORT request and consent evidence.")]);
  return input.runtimeContext;
}
