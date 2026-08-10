import { normalizePlaybookRole } from "@/lib/roles/registry";

export const GOOGLE_LOGIN_ERROR_MESSAGE =
  "We couldn't continue with Google. Please try again or use your email and password.";

export function buildGoogleCallbackUrl(origin: string, requestedRole: string): string {
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("provider", "google");
  callback.searchParams.set("role", normalizePlaybookRole(requestedRole));
  return callback.toString();
}

export function getGoogleRequestedRole(
  callbackProvider: string | null,
  requestedRole: string | null,
  authProvider: string | null,
  existingProfile: boolean
): string | null {
  if (
    existingProfile ||
    callbackProvider !== "google" ||
    authProvider !== "google" ||
    !requestedRole
  ) {
    return null;
  }

  return normalizePlaybookRole(requestedRole);
}
