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
  // Studio owns its purpose-built operator shell. Nesting it inside the product
  // shell creates two competing navigation authorities on every Studio route.
  if (pathname === "/studio" || pathname.startsWith("/studio/")) return false;
  return !isPublicRoute(pathname);
}
