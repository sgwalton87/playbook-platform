import type { OnboardingData } from "./types";

export function mapOnboardingToProfilePayload(input: {
  userId: string;
  role: string;
  data: OnboardingData;
  stepIndex: number;
  complete: boolean;
}) {
  const firstName = String(input.data.first_name || "").trim();
  const lastName = String(input.data.last_name || "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || String(input.data.full_name || "").trim();
  const topSchools = Array.isArray(input.data.top_schools) ? input.data.top_schools.filter(Boolean) : [];
  const activities = Array.isArray(input.data.activities) ? input.data.activities.filter(Boolean) : [];
  const inviteSupporters = Array.isArray(input.data.invite_supporters) ? input.data.invite_supporters.filter(Boolean) : [];

  return {
    id: input.userId,
    first_name: firstName || null,
    last_name: lastName || null,
    full_name: fullName || null,
    username: input.data.username || null,
    avatar_url: input.data.avatar_url || null,
    bio: input.data.bio || null,
    school: input.data.school || null,
    grade: input.data.grade || null,
    dream_school: input.data.dream_school || null,
    ideal_profession: input.data.ideal_profession || null,
    onboarding_data: {
      ...input.data,
      top_schools: topSchools,
      activities,
      invite_supporters: inviteSupporters,
      onboarding_step_index: input.stepIndex,
    },
    // Client autosave is intentionally profile-data-only. Durable role,
    // verification state, and onboarding completion are authority-bearing and
    // may only be changed through the authenticated profile RPC boundaries.
    public_profile_complete: Boolean(
      fullName && input.data.username && input.data.bio
    ),
    community_safety_agreed: Boolean(input.data.community_safety_agreed),
    community_safety_agreed_at: input.data.community_safety_agreed
      ? new Date().toISOString()
      : null,
    community_safety_policy_version: input.data.community_safety_agreed
      ? "playbook-safety-v1"
      : null,
  };
}
