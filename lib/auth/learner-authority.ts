import { requirePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";

export const LEARNER_ROLES = ["scholar", "scholar-athlete", "transition-youth"] as const satisfies readonly PlaybookRole[];

export type LearnerRole = (typeof LEARNER_ROLES)[number];

type ProfileReader = {
  from(table: "profiles"): {
    select(columns: string): {
      eq(column: "id", value: string): {
        maybeSingle(): Promise<{ data: { role?: string | null; profile_mode?: string | null; onboarding_completed?: boolean | null } | null; error: { message: string } | null }>;
      };
    };
  };
};

export async function requireLearnerAuthority(
  supabase: ProfileReader,
  userId: string,
  options: { requireOnboarding?: boolean } = {}
): Promise<LearnerRole> {
  const profile = await supabase
    .from("profiles")
    .select("role,profile_mode,onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  if (profile.error) throw new Error(profile.error.message);
  if (!profile.data) throw new Error("A durable Playbook learner profile is required.");

  const role = requirePlaybookRole(profile.data.profile_mode ?? profile.data.role);
  if (!(LEARNER_ROLES as readonly PlaybookRole[]).includes(role)) {
    throw new Error("This capability is restricted to Scholar, Scholar-Athlete, and Transition-Aged Youth accounts.");
  }
  if (options.requireOnboarding && !profile.data.onboarding_completed) {
    throw new Error("Complete learner onboarding before using this capability.");
  }

  return role as LearnerRole;
}
