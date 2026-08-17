import { requireUser } from "@/lib/supabase/server";
import { isPlatformOperatorRole } from "@/lib/auth/platformOperator";

export async function requirePlatformOperator() {
  const { supabase, user } = await requireUser();
  if (!user) return { authorized: false as const, authenticated: false as const };

  const profile = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile.error || !profile.data || !isPlatformOperatorRole(profile.data.role)) {
    return { authorized: false as const, authenticated: true as const };
  }

  return { authorized: true as const, authenticated: true as const };
}
