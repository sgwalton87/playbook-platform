import { digestValue } from "../context";
import type { ConsentRecord, IdentityInput, OwnershipRecord } from "./contracts";
export function createOwnershipRecord(input: IdentityInput, consents: ConsentRecord[]): OwnershipRecord {
  const body = { ownerIdentity: input.identityData.personReference, stewardIdentity: "PBOS" as const, ownedDataCategories: input.identityData.attributes.map(({ name }) => name).sort(), accessRights: [...new Set(input.identityData.requestedPermissions)].sort(), sharingPermissions: input.identityData.requestedPermissions.filter((permission) => ["VIEW", "SHARE", "EXPORT", "CONNECT", "REVOKE"].includes(permission)).sort(), transferRules: ["The person initiates export.", "The receiving system receives only consented categories.", "PBOS retains provenance without transferring ownership."], consentHistoryIds: consents.map(({ consentId }) => consentId).sort(), personOwnsRecord: true as const };
  return { ownershipId: `PBOS-ID-OWNER-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
