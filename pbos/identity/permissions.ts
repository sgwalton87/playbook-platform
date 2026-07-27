import { digestValue } from "../context";
import type { ConsentRecord, IdentityAccessDecision, IdentityInput, PermissionGrant } from "./contracts";
export function createPermissionGrants(input: IdentityInput, consents: ConsentRecord[]): PermissionGrant[] {
  return consents.filter(({ status }) => status === "GRANTED").map((consent) => {
    const body = { personReference: consent.personReference, recipient: consent.authorizedRecipient, permissions: [...input.requestedPermissions].sort(), dataCategories: [...consent.dataCategories].sort(), privacyCeiling: "PRIVATE" as const, consentId: consent.consentId, defaultVisibility: "PRIVATE" as const };
    return { permissionId: `PBOS-ID-PERM-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
  }).sort((a, b) => a.permissionId.localeCompare(b.permissionId));
}
export function createAccessDecision(input: IdentityInput, consents: ConsentRecord[]): IdentityAccessDecision {
  const consent = consents.find(({ authorizedRecipient, purpose, status }) => authorizedRecipient === input.accessRequester && purpose === input.accessPurpose && status === "GRANTED")!;
  return { authorized: true, requester: input.accessRequester, purpose: input.accessPurpose, permissions: [...input.requestedPermissions].sort(), dataCategories: [...input.requestedDataCategories].sort(), consentId: consent.consentId, limitations: ["Authorization is limited to the recorded purpose, recipient, categories, permissions, and consent lifetime."] };
}
