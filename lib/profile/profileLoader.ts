import { supabase } from "@/lib/supabaseClient";
import { createProfileDefaults } from "./profileDefaults";
import type { CanonicalProfile } from "./types";

export async function loadProfile(
  userId: string,
  email?: string | null,
  fallbackRole = "scholar"
): Promise<{
  profile: CanonicalProfile;
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return {
      profile: createProfileDefaults(
        userId,
        email,
        fallbackRole
      ),
      error: new Error(error.message),
    };
  }

  const defaults = createProfileDefaults(
    userId,
    email,
    fallbackRole
  );

  const profile: CanonicalProfile = {
    ...defaults,
    ...(data || {}),
    id: userId,
    email: data?.email || email || null,
    role:
      data?.profile_mode ||
      data?.role ||
      fallbackRole,
    profile_mode:
      data?.profile_mode ||
      data?.role ||
      fallbackRole,
    onboarding_data:
      data?.onboarding_data &&
      typeof data.onboarding_data === "object"
        ? data.onboarding_data
        : {},
  };

  return {
    profile,
    error: null,
  };
}

export async function loadCurrentProfile(): Promise<{
  profile: CanonicalProfile | null;
  error: Error | null;
}> {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      profile: null,
      error: new Error(
        error?.message || "No authenticated user."
      ),
    };
  }

  return loadProfile(
    data.user.id,
    data.user.email,
    data.user.user_metadata?.profile_mode ||
      data.user.user_metadata?.role ||
      "scholar"
  );
}
