export const BETA_EXPOSURE_MODES = ["off", "allowlist"] as const;
export type BetaExposureMode = (typeof BETA_EXPOSURE_MODES)[number];

const PUBLIC_PAGE_ROUTES = [
  "/",
  "/auth/callback",
  "/beta-unavailable",
  "/check-email",
  "/invite",
  "/login",
  "/reset-password",
  "/role-select",
  "/start",
] as const;

const GOVERNED_PAGE_ROUTES = [
  "/admin/nil-compliance",
  "/action-routing",
  "/application-workspaces",
  "/dashboard",
  "/evidence",
  "/invitations",
  "/notifications",
  "/opportunities",
  "/profile",
  "/record",
  "/scholar-athlete-os",
  "/settings",
  "/support-messages",
  "/support-network",
] as const;

const PUBLIC_API_ROUTES = [
  "/api/health/live",
  "/api/health/metrics",
  "/api/health/ready",
  "/api/invitations/accept",
  "/api/onboarding/complete",
  "/api/telemetry/client",
] as const;

const GOVERNED_API_ROUTES = [
  "/api/admin/nil-compliance",
  "/api/action-routing",
  "/api/analytics/events",
  "/api/application-workspaces",
  "/api/athlete",
  "/api/evidence",
  "/api/events/emit",
  "/api/health/ready",
  "/api/invitations",
  "/api/notifications",
  "/api/onboarding/complete",
  "/api/portfolio",
  "/api/scholar-context",
  "/api/settings/analytics-consent",
  "/api/settings/ai-consent",
  "/api/support-network",
] as const;

export type BetaRouteDecision =
  | { outcome: "allow_public" }
  | { outcome: "allow_governed"; requiresGrant: boolean }
  | { outcome: "deny"; response: "page" | "api" };

function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || (route !== "/" && pathname.startsWith(`${route}/`));
}

function matchesAny(pathname: string, routes: readonly string[]): boolean {
  return routes.some((route) => matchesRoute(pathname, route));
}

export function parseBetaExposureMode(value: string | undefined): BetaExposureMode {
  return value === "allowlist" ? "allowlist" : "off";
}

export function decideBetaRoute(
  pathname: string,
  mode: BetaExposureMode,
  requireAccessGrant: boolean,
): BetaRouteDecision {
  if (mode === "off") return { outcome: "allow_public" };

  if (matchesAny(pathname, PUBLIC_PAGE_ROUTES)) {
    return { outcome: "allow_public" };
  }

  if (pathname.startsWith("/portfolio/")) {
    return { outcome: "allow_public" };
  }

  if (matchesAny(pathname, PUBLIC_API_ROUTES)) {
    return { outcome: "allow_public" };
  }

  if (matchesAny(pathname, GOVERNED_PAGE_ROUTES)) {
    return { outcome: "allow_governed", requiresGrant: requireAccessGrant };
  }

  if (matchesAny(pathname, GOVERNED_API_ROUTES)) {
    return { outcome: "allow_governed", requiresGrant: requireAccessGrant };
  }

  return {
    outcome: "deny",
    response: pathname.startsWith("/api/") ? "api" : "page",
  };
}
