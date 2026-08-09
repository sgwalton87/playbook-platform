import { normalizePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";

export const SIGNUP_PASSWORD_MIN_LENGTH = 8;

export type SignupMetadata = {
  role: PlaybookRole;
  profile_mode: PlaybookRole;
  requested_role: PlaybookRole;
  verification_status: "email_pending";
};

export function buildSignupMetadata(role?: string | null): SignupMetadata {
  const normalizedRole = normalizePlaybookRole(role);

  return {
    role: normalizedRole,
    profile_mode: normalizedRole,
    requested_role: normalizedRole,
    verification_status: "email_pending",
  };
}

export function getSignupErrorMessage(): string {
  return "We couldn't create your account. Check your details or try logging in if you already have an account.";
}
