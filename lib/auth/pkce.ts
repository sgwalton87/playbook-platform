import type { SupabaseClientOptions } from "@supabase/supabase-js";

export const PKCE_CALLBACK_ERROR_MESSAGE =
  "We couldn't verify this secure sign-in link. Start again from the login page.";

/**
 * Supabase SSR uses PKCE by default. URL detection is disabled because the
 * Playbook callback explicitly performs the one-time exchange before applying
 * profile authority and routing rules.
 */
export const PLAYBOOK_PKCE_AUTH_OPTIONS = {
  flowType: "pkce",
  detectSessionInUrl: false,
  persistSession: true,
  autoRefreshToken: true,
} satisfies NonNullable<SupabaseClientOptions<"public">["auth"]>;

export function isPkceVerifierCookie(name: string): boolean {
  return name.includes("-code-verifier");
}
