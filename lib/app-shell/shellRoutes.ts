export const publicRoutes = [
  "/",
  "/login",
  "/reset-password",
  "/auth/callback",
];

export function isPublicRoute(pathname: string) {
  if (publicRoutes.includes(pathname)) return true;
  if (pathname.startsWith("/invite/")) return true;
  return false;
}

export function shouldUseAppShell(pathname: string) {
  return !isPublicRoute(pathname);
}
