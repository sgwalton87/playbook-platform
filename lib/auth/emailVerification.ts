import type { User } from "@supabase/supabase-js";

export const EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

export const EMAIL_VERIFICATION_RESEND_ERROR_MESSAGE =
  "We couldn't send another verification email right now. Wait a moment and try again.";

export const EMAIL_VERIFICATION_INVALID_LINK_MESSAGE =
  "That verification link is invalid or has expired. Request a new link or return to login.";

export type EmailVerificationOtpType = "email" | "signup";

export function getEmailVerificationOtpType(value: string | null): EmailVerificationOtpType | null {
  return value === "email" || value === "signup" ? value : null;
}

export function hasVerifiedEmail(user: Pick<User, "email_confirmed_at">): boolean {
  return typeof user.email_confirmed_at === "string" && user.email_confirmed_at.length > 0;
}

export function isResendableEmail(value: string | null): value is string {
  if (!value || value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function maskEmail(value: string): string {
  const separator = value.lastIndexOf("@");
  if (separator <= 0) return "your email address";

  const local = value.slice(0, separator);
  const domain = value.slice(separator + 1);
  const visibleLocal = local.slice(0, Math.min(2, local.length));
  return `${visibleLocal}${"•".repeat(Math.max(3, Math.min(8, local.length - visibleLocal.length)))}@${domain}`;
}

export function buildEmailVerificationCallbackUrl(origin: string): string {
  return `${origin}/auth/callback`;
}
