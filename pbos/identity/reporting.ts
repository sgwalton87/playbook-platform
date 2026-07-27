import { digestValue } from "../context";
import type { IdentityInput, IdentityProvenance, IdentityReport } from "./contracts";
import { createConsentRecords } from "./consent";
import { createOwnershipRecord } from "./ownership";
import { createAccessDecision, createPermissionGrants } from "./permissions";
import { createPersonIdentity } from "./person";
import { createPortableIdentities } from "./portability";
import { validateIdentityInput } from "./validation";
import { createVerifications } from "./verification";
export function createIdentityReport(input: IdentityInput): IdentityReport {
  const context = validateIdentityInput(input);
  const consentHistory = createConsentRecords(input.consentDrafts);
  const evidence = [...new Set([...input.identityData.evidenceReferences, ...input.identityData.attributes.flatMap(({ evidenceReferences }) => evidenceReferences), ...input.consentDrafts.flatMap(({ evidenceReferences }) => evidenceReferences), ...input.verificationDrafts.flatMap(({ evidenceReferences }) => evidenceReferences), ...input.portabilityRequests.flatMap(({ consentEvidenceReferences }) => consentEvidenceReferences), ...input.modificationHistory.flatMap(({ evidenceReferences }) => evidenceReferences)])].sort();
  const provenance: IdentityProvenance = { sourceReferences: [...new Set(input.identityData.attributes.map(({ sourceReference }) => sourceReference))].sort(), createdAt: input.generatedAt, modificationHistory: [...input.modificationHistory].sort((a, b) => a.modificationId.localeCompare(b.modificationId)), authorizedActor: input.identityData.personReference, evidenceReferences: evidence, consentBasisIds: consentHistory.map(({ consentId }) => consentId).sort(), runtimeContextDigest: context.contextDigest };
  const identityState = createPersonIdentity(input, consentHistory, provenance);
  const ownershipInformation = createOwnershipRecord(input, consentHistory);
  const body = { generatedAt: input.generatedAt, runtimeContextDigest: context.contextDigest, identityState, ownershipInformation, permissions: createPermissionGrants(input, consentHistory), consentHistory, verificationStatus: createVerifications(input.verificationDrafts), privacyControls: identityState.privacySettings, portableIdentities: createPortableIdentities(input, ownershipInformation), accessDecision: createAccessDecision(input, consentHistory), provenanceEvidence: evidence, limitations: ["Identity information does not measure worth, reputation, personality, potential, or eligibility.", "PBOS is a steward; the person retains ownership, correction, revocation, sharing, and portability authority."] };
  return { reportId: `PBOS-ID-REPORT-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
