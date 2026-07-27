import { digestValue } from "../context";
import type { IdentityVerification, VerificationDraft } from "./contracts";
export function createVerifications(drafts: VerificationDraft[]): IdentityVerification[] {
  return drafts.map((draft) => { const body = { ...draft, evidenceReferences: [...draft.evidenceReferences].sort() }; return { verificationId: `PBOS-ID-VERIFY-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body }; }).sort((a, b) => a.verificationId.localeCompare(b.verificationId));
}
