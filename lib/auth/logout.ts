export type LogoutClient = {
  auth: {
    signOut: (options?: { scope?: "global" | "local" | "others" }) => Promise<{
      error: { message: string } | null;
    }>;
  };
};

export type LogoutResult =
  | { ok: true }
  | { ok: false; message: string };

const LOGOUT_ERROR_MESSAGE =
  "We couldn't sign you out. Check your connection and try again.";

/**
 * Revokes the current identity's Supabase refresh sessions and clears the
 * browser session through the configured SSR cookie adapter.
 */
export async function logout(client: LogoutClient): Promise<LogoutResult> {
  const { error } = await client.auth.signOut({ scope: "global" });

  if (error) {
    return { ok: false, message: LOGOUT_ERROR_MESSAGE };
  }

  return { ok: true };
}
