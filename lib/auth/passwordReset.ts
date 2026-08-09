export const PASSWORD_RESET_MIN_LENGTH = 8;

export function buildPasswordResetRedirect(origin: string): string {
  return `${origin.replace(/\/$/, "")}/reset-password`;
}

export function isValidResetPassword(password: string, confirmation: string): boolean {
  return password.length >= PASSWORD_RESET_MIN_LENGTH && password === confirmation;
}

export function getPasswordResetRequestMessage(): string {
  return "If an account matches that email, we sent a secure password reset link. Check your inbox and spam folder.";
}

export function getPasswordResetErrorMessage(): string {
  return "We couldn't complete that password reset. Request a new link and try again.";
}
