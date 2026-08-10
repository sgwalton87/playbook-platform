export const PASSWORD_RESET_MIN_LENGTH = 8;

export const PASSWORD_RESET_REQUEST_MESSAGE =
  "If an account matches that email, we sent a secure password reset link. Check your inbox and spam folder.";

export const PASSWORD_RESET_REQUEST_ERROR =
  "We couldn't send a reset link right now. Please wait a moment and try again.";

export const PASSWORD_RESET_LINK_ERROR =
  "This password reset link is invalid or has expired. Request a new link to continue.";

export const PASSWORD_RESET_UPDATE_ERROR =
  "We couldn't update your password. Request a new reset link and try again.";

export function buildPasswordResetRedirectUrl(origin: string): string {
  return new URL("/reset-password", origin).toString();
}

export function validateResetPasswords(password: string, confirmation: string): string | null {
  if (password.length < PASSWORD_RESET_MIN_LENGTH) {
    return `Use at least ${PASSWORD_RESET_MIN_LENGTH} characters.`;
  }

  if (password !== confirmation) {
    return "The passwords do not match.";
  }

  return null;
}
