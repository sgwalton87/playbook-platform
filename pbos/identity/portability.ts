import { digestValue } from "../context";
import type { IdentityInput, OwnershipRecord, PortableIdentity } from "./contracts";
export function createPortableIdentities(input: IdentityInput, ownership: OwnershipRecord): PortableIdentity[] {
  return input.portabilityRequests.map((request) => {
    const body = { personReference: request.personReference, exportableIdentityData: input.identityData.attributes.filter(({ name }) => request.requestedCategories.includes(name)).map((attribute) => ({ ...attribute, evidenceReferences: [...attribute.evidenceReferences].sort() })).sort((a, b) => a.name.localeCompare(b.name)), ownershipProof: ownership, sharingPermissions: [...request.permissions].sort(), provenanceHistory: [...input.modificationHistory].sort((a, b) => a.modificationId.localeCompare(b.modificationId)), receivingSystemInformation: request.receivingSystem, controlledByPerson: true as const };
    return { portabilityId: `PBOS-ID-PORT-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
  }).sort((a, b) => a.portabilityId.localeCompare(b.portabilityId));
}
