import { digestValue } from "../context";
import type { AthleticOrganization, AthleticOrganizationDraft, AthleticProvenance } from "./contracts";
export function createAthleticOrganizations(drafts: AthleticOrganizationDraft[], provenance: AthleticProvenance): AthleticOrganization[] {
  return drafts.map((draft) => { const body = { ...draft, contactPermissions: [...draft.contactPermissions].sort(), opportunitySourceReferences: [...draft.opportunitySourceReferences].sort(), evidenceReferences: [...draft.evidenceReferences].sort(), provenance: { ...provenance, sourceReferences: [draft.organizationIdentity], evidenceReferences: [...draft.evidenceReferences].sort() } }; return { organizationId: `PBOS-ATH-ORG-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body }; }).sort((a, b) => a.organizationId.localeCompare(b.organizationId));
}
