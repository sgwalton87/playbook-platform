import { requirePlaybookRole } from "@/lib/roles/registry";

export const GOOGLE_LOGIN_ERROR_MESSAGE =
  "We couldn't continue with Google. Please try again or use your email and password.";

export type GoogleAuthSurface = "login" | "signup";

function detectGoogleAuthSurface(): GoogleAuthSurface {
  if (typeof document === "undefined") return "signup";
  const surface = document
    .querySelector<HTMLElement>("[data-auth-surface]")
    ?.dataset.authSurface;
  return surface === "login" ? "login" : "signup";
}

export function buildGoogleCallbackUrl(
  origin: string,
  requestedRole?: string | null,
  authSurface?: GoogleAuthSurface
): string {
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("provider", "google");

  const surface = authSurface ?? detectGoogleAuthSurface();
  if (surface === "signup") {
    callback.searchParams.set("role", requirePlaybookRole(requestedRole));
  }

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

  return requirePlaybookRole(requestedRole);
}
