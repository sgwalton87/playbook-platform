import { getRoleDestination, normalizePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";

export type OnboardingCompletionSuccess = { ok: true; profileId: string; recordId: string; role: PlaybookRole; destination: string };
export type OnboardingCompletionFailure = { ok: false; stage: "authentication" | "validation" | "persistence"; code: string; message: string };
export type OnboardingCompletionResult = OnboardingCompletionSuccess | OnboardingCompletionFailure;

export function validateCompletionPayload(payload: Record<string, unknown>): OnboardingCompletionFailure | null {
  if (!payload.community_safety_agreed) {
    return { ok: false, stage: "validation", code: "safety_agreement_required", message: "Community safety agreement is required." };
  }
  if (!String(payload.full_name || "").trim()) {
    return { ok: false, stage: "validation", code: "identity_required", message: "A name is required to complete onboarding." };
  }
  return null;
}

export function buildCompletionSuccess(data: { profileId: string; recordId: string; role: string }): OnboardingCompletionSuccess {
  const role = normalizePlaybookRole(data.role);
  return { ok: true, profileId: data.profileId, recordId: data.recordId, role, destination: getRoleDestination(role) };
}
