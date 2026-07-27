import { digestValue } from "../context";
import type { ConsentDraft, ConsentRecord } from "./contracts";
export function createConsentRecords(drafts: ConsentDraft[]): ConsentRecord[] {
  return drafts.map((draft) => {
    const body = { ...draft, dataCategories: [...draft.dataCategories].sort(), evidenceReferences: [...draft.evidenceReferences].sort() };
    return { consentId: `PBOS-ID-CONSENT-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
  }).sort((a, b) => a.consentId.localeCompare(b.consentId));
}
