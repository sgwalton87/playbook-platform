export const INVITE_TOKEN_STORAGE_KEY = "playbook_pending_invite_token";

export function buildInviteLoginPath(token: string) {
  return `/login?invite=${encodeURIComponent(token)}`;
}

export function buildInviteSignupPath(token: string) {
  return `/login?mode=signup&invite=${encodeURIComponent(token)}`;
}

export function getInviteRedirectPath(token?: string | null) {
  if (!token) return "/role-select";
  return `/invite/${encodeURIComponent(token)}`;
}

export function shouldResumeInvite(token?: string | null) {
  return Boolean(token && token.trim().length > 10);
}
