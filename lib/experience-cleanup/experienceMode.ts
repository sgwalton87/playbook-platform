import { requirePlaybookRole, PLAYBOOK_ROLES } from "@/lib/roles/registry";

export type ExperienceMode = "active" | "foundation" | "demo" | "studio";

export function getExperienceMode(pathname: string): ExperienceMode {
  if (pathname.startsWith("/studio")) return "studio";
  if (pathname.startsWith("/demo")) return "demo";

  const foundationRoutes = [
    "/economy",
    "/reward-economy",
    "/store-v2",
    "/application-workspaces",
    "/portfolio",
    "/recommenders",
  ];

  if (foundationRoutes.some((route) => pathname.startsWith(route))) {
    return "foundation";
  }

  return "active";
}

export function getExperienceModeLabel(mode: ExperienceMode) {
  if (mode === "active") return "Active Workspace";
  if (mode === "foundation") return "Foundation Preview";
  if (mode === "demo") return "Demo Mode";
  return "Founder / Studio";
}

export function getRoleHomeRoute(role?: string | null) {
  if (!role) return "/dashboard"; // Compatibility-only anonymous route; never authorization.
  const identity = role.trim().toLowerCase();
  if (["founder", "admin", "super_admin"].includes(identity)) return "/studio";
  try {
    const canonical = requirePlaybookRole(identity);
    return PLAYBOOK_ROLES[canonical].osRoute;
  } catch {
    return "/start"; // Unknown roles do not silently inherit Scholar OS.
  }
}
