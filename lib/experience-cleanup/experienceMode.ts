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
  if (!role) return "/dashboard";

  const normalized = role.toLowerCase();

  if (["founder", "admin", "super_admin"].includes(normalized)) return "/studio";
  if (normalized.includes("athlete")) return "/scholar-athlete-os";
  if (normalized.includes("family") || normalized.includes("guardian")) return "/family-os";
  if (normalized.includes("educator")) return "/educator-os";
  if (normalized.includes("mentor")) return "/mentor-os";
  if (normalized.includes("district")) return "/district-os";
  if (normalized.includes("university")) return "/university-os";
  if (normalized.includes("employer")) return "/employer-os";

  return "/dashboard";
}
