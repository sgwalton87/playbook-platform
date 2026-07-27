import { digestValue } from "../context";
import type { ConsentRecord, IdentityInput, IdentityProvenance, PersonIdentity } from "./contracts";
export function createPersonIdentity(input: IdentityInput, consents: ConsentRecord[], provenance: IdentityProvenance): PersonIdentity {
  const attributes = input.identityData.attributes.map((attribute) => ({ ...attribute, evidenceReferences: [...attribute.evidenceReferences].sort() })).sort((a, b) => a.name.localeCompare(b.name));
  const body = { personReference: input.identityData.personReference, attributes, preferredInformation: Object.fromEntries(Object.entries(input.identityData.preferredInformation).sort(([a], [b]) => a.localeCompare(b))), ownershipStatus: "PERSON_OWNED_PBOS_STEWARD" as const, permissions: [...new Set(input.identityData.requestedPermissions)].sort(), privacySettings: Object.fromEntries(Object.entries(input.identityData.privacySettings).sort(([a], [b]) => a.localeCompare(b))), provenance: { ...provenance, consentBasisIds: consents.map(({ consentId }) => consentId).sort() } };
  return { identityId: `PBOS-ID-PERSON-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
