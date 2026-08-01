export type RoleShellRole =
  | "scholar"
  | "scholar-athlete"
  | "mentor"
  | "founder"
  | "family"
  | "educator"
  | "coach"
  | "brand-partner"
  | "college-coach"
  | "college-admissions"
  | "employer"
  | "district"
  | "transition-youth";

export interface RoleNavigationItem {
  href: string;
  label: string;
  description?: string;
  requiresPermission?: string;
}

export interface RoleShellState {
  role: RoleShellRole;
  notificationCount: number;
  settingsStatus: "configured" | "needs-attention";
  evidenceStatus: "ready" | "pending";
  permissions: string[];
}

export interface RoleContentSurface {
  title: string;
  summary: string;
  highlights: string[];
  actions: string[];
  evidence: Array<{ label: string; status: string }>;
}

export interface RoleShellContext {
  role?: string | null;
  profileMode?: string | null;
  pathname?: string | null;
  permissions?: string[];
}

const ROLE_NAVIGATION: Record<RoleShellRole, RoleNavigationItem[]> = {
  scholar: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  "scholar-athlete": [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/record", label: "Record" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  mentor: [
    { href: "/mentor-os", label: "Mentor OS" },
    { href: "/mentorship", label: "Mentorship" },
    { href: "/messages", label: "Messages" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  founder: [
    { href: "/founder", label: "Founder OS" },
    { href: "/admin", label: "Admin" },
    { href: "/permissions", label: "Permissions", requiresPermission: "view_equity_metrics" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  family: [
    { href: "/family-os", label: "Family OS" },
    { href: "/profile", label: "Profile" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  educator: [
    { href: "/educator-os", label: "Educator OS" },
    { href: "/connections", label: "Connections" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  coach: [
    { href: "/scholar-athlete-os", label: "Athlete OS" },
    { href: "/connections", label: "Connections" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  "brand-partner": [
    { href: "/brand-partner-os", label: "Brand Partner OS" },
    { href: "/connections", label: "Connections" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  "college-coach": [
    { href: "/university-os", label: "Recruiting OS" },
    { href: "/record", label: "Records" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  "college-admissions": [
    { href: "/university-os", label: "Admissions OS" },
    { href: "/record", label: "Records" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  employer: [
    { href: "/employer-os", label: "Employer OS" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  district: [
    { href: "/district-os", label: "District OS" },
    { href: "/admin", label: "Admin" },
    { href: "/permissions", label: "Permissions" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
  "transition-youth": [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ],
};

const ROLE_PERMISSION_MAP: Record<RoleShellRole, string[]> = {
  scholar: ["view_progress"],
  "scholar-athlete": ["view_progress", "view_verified_record"],
  mentor: ["recommend_actions", "support_tasks"],
  founder: ["view_cohort", "view_equity_metrics"],
  family: ["view_progress", "support_tasks"],
  educator: ["verify_evidence", "recommend_actions"],
  coach: ["support_tasks", "recommend_actions"],
  "brand-partner": ["create_opportunities"],
  "college-coach": ["view_verified_record", "recommend_actions"],
  "college-admissions": ["view_verified_record", "recommend_actions"],
  employer: ["create_opportunities", "review_candidates"],
  district: ["view_cohort", "view_equity_metrics"],
  "transition-youth": ["view_progress"],
};

export function resolveRoleFromPathname(pathname: string): RoleShellRole {
  if (pathname.startsWith("/mentor") || pathname.startsWith("/mentorship")) return "mentor";
  if (pathname.startsWith("/founder") || pathname.startsWith("/admin")) return "founder";
  if (pathname.startsWith("/family") || pathname.startsWith("/family-os")) return "family";
  if (pathname.startsWith("/educator") || pathname.startsWith("/educator-os")) return "educator";
  if (pathname.startsWith("/brand-partner") || pathname.startsWith("/brand-partner-os")) return "brand-partner";
  if (pathname.startsWith("/district") || pathname.startsWith("/district-os")) return "district";
  if (pathname.startsWith("/employer") || pathname.startsWith("/employer-os")) return "employer";
  if (pathname.startsWith("/university") || pathname.startsWith("/university-os")) return "college-admissions";
  if (pathname.startsWith("/record") || pathname.startsWith("/scholar-athlete")) return "scholar-athlete";
  if (pathname.startsWith("/transition") || pathname.startsWith("/tay")) return "transition-youth";
  return "scholar";
}

export function getRoleNavigationItems(role: RoleShellRole | string, permissions: string[] = []): RoleNavigationItem[] {
  const normalizedRole = (role as RoleShellRole) || "scholar";
  const baseItems = ROLE_NAVIGATION[normalizedRole] ?? ROLE_NAVIGATION.scholar;

  return baseItems.filter((item) => {
    if (!item.requiresPermission) return true;
    return permissions.includes(item.requiresPermission);
  });
}

export function getRoleShellState(role: RoleShellRole | string): RoleShellState {
  const normalizedRole = (role as RoleShellRole) || "scholar";
  const permissions = ROLE_PERMISSION_MAP[normalizedRole] ?? ROLE_PERMISSION_MAP.scholar;

  return {
    role: normalizedRole,
    notificationCount: normalizedRole === "mentor" ? 3 : normalizedRole === "founder" ? 5 : 2,
    settingsStatus: normalizedRole === "scholar" ? "needs-attention" : "configured",
    evidenceStatus: normalizedRole === "educator" || normalizedRole === "mentor" ? "ready" : "pending",
    permissions,
  };
}

export function getRoleShellStateFromContext(context: RoleShellContext): RoleShellState {
  const resolvedRole = resolveRoleFromPathname(context.pathname ?? "/") || "scholar";
  const roleFromProfile = context.role || context.profileMode;
  const normalizedRole = resolveRoleFromProfile(roleFromProfile, resolvedRole);
  const permissions = context.permissions?.length ? context.permissions : getRoutePermissions(context.pathname ?? "/", roleFromProfile, context.profileMode);

  return {
    role: normalizedRole,
    notificationCount: normalizedRole === "mentor" ? 3 : normalizedRole === "founder" ? 5 : 2,
    settingsStatus: normalizedRole === "scholar" ? "needs-attention" : "configured",
    evidenceStatus: normalizedRole === "educator" || normalizedRole === "mentor" ? "ready" : "pending",
    permissions,
  };
}

export function getRoleContentSurface(role: RoleShellRole | string, permissions: string[] = [], pathname?: string | null): RoleContentSurface {
  const normalizedRole = (role as RoleShellRole) || "scholar";
  const permissionSet = permissions.length ? permissions : ROLE_PERMISSION_MAP[normalizedRole] ?? ROLE_PERMISSION_MAP.scholar;

  const surfaces: Record<RoleShellRole, RoleContentSurface> = {
    scholar: {
      title: "Scholar OS",
      summary: "Follow your next best step and keep your record current.",
      highlights: ["Academic readiness", "Opportunity matching", "Upcoming deadlines"],
      actions: ["Review next step", "Update profile", "Open opportunities"],
      evidence: [{ label: "Transcript update", status: "ready" }, { label: "Recommendation request", status: "pending" }],
    },
    "scholar-athlete": {
      title: "Scholar-Athlete OS",
      summary: "Balance academics, recruiting, and life after sport.",
      highlights: ["Eligibility signals", "Recruiting readiness", "Athlete evidence"],
      actions: ["Update athletic profile", "Review record", "Share evidence"],
      evidence: [{ label: "Eligibility checklist", status: "ready" }, { label: "Coach note", status: "pending" }],
    },
    mentor: {
      title: "Mentor OS",
      summary: "Support scholars with timely guidance and clear next moves.",
      highlights: ["Student check-ins", "Support requests", "Evidence feedback"],
      actions: ["Confirm check-ins", "Review student evidence", "Send encouragement"],
      evidence: [{ label: "Student check-in", status: "ready" }, { label: "Recommendation note", status: "shared" }],
    },
    founder: {
      title: "Founder OS",
      summary: "Coordinate visibility, trust, and platform operations.",
      highlights: ["Platform health", "Permission oversight", "Role activation"],
      actions: ["Review admin queue", "Inspect permissions", "Open platform health"],
      evidence: [{ label: "Platform audit", status: "ready" }, { label: "Role activation review", status: "pending" }],
    },
    family: {
      title: "Family OS",
      summary: "Stay aligned with your scholar’s progress and support needs.",
      highlights: ["Deadlines", "Support tasks", "Progress updates"],
      actions: ["Review scholar brief", "Confirm support task", "Open family notes"],
      evidence: [{ label: "Scholar milestone", status: "ready" }, { label: "Family note", status: "pending" }],
    },
    educator: {
      title: "Educator OS",
      summary: "Bring clarity to students who need coaching and verification.",
      highlights: ["Verification requests", "Recommendations", "Student signals"],
      actions: ["Review verification queue", "Send recommendation", "Flag student concern"],
      evidence: [{ label: "Student evidence", status: "ready" }, { label: "Recommendation letter", status: "pending" }],
    },
    coach: {
      title: "Coach OS",
      summary: "Coordinate athlete development and recruiting support.",
      highlights: ["Athlete progress", "Recruiting touchpoints", "Support requests"],
      actions: ["Review athlete roster", "Share recommendation", "Open recruiting notes"],
      evidence: [{ label: "Roster update", status: "ready" }, { label: "Recruiting note", status: "pending" }],
    },
    "brand-partner": {
      title: "Brand Partner OS",
      summary: "Launch partnerships that create opportunity and measurable impact.",
      highlights: ["Campaign planning", "Partner opportunities", "Reward coordination"],
      actions: ["Review campaigns", "Open partner brief", "Create opportunity"],
      evidence: [{ label: "Partnership brief", status: "ready" }, { label: "Campaign metric", status: "pending" }],
    },
    "college-coach": {
      title: "Recruiting OS",
      summary: "Find verified scholars and match them to the right pathways.",
      highlights: ["Verified records", "Recruiting fit", "Pathway signals"],
      actions: ["Review verified scholars", "Create outreach list", "Open records"],
      evidence: [{ label: "Verified scholar profile", status: "ready" }, { label: "Recruiting note", status: "pending" }],
    },
    "college-admissions": {
      title: "Admissions OS",
      summary: "Evaluate readiness and connect the right scholars to your institution.",
      highlights: ["Readiness evidence", "Institutional fit", "Decision support"],
      actions: ["Review admissions pool", "Open records", "Prioritize fit"],
      evidence: [{ label: "Admissions brief", status: "ready" }, { label: "Transcript review", status: "pending" }],
    },
    employer: {
      title: "Employer OS",
      summary: "Discover verified talent and build meaningful workforce pathways.",
      highlights: ["Talent pipeline", "Verified skills", "Opportunity matching"],
      actions: ["Review talent pool", "Create opportunity", "Open candidate brief"],
      evidence: [{ label: "Candidate profile", status: "ready" }, { label: "Workforce note", status: "pending" }],
    },
    district: {
      title: "District OS",
      summary: "Turn readiness data into equitable support and action.",
      highlights: ["Cohort trends", "Equity metrics", "Opportunity gaps"],
      actions: ["Review district metrics", "Prioritize interventions", "Open admin view"],
      evidence: [{ label: "District readiness report", status: "ready" }, { label: "Intervention log", status: "pending" }],
    },
    "transition-youth": {
      title: "Transition-Aged Youth OS",
      summary: "Support next-step planning for independent adulthood.",
      highlights: ["Transition planning", "Goal progress", "Support network"],
      actions: ["Review goals", "Open support network", "Update next step"],
      evidence: [{ label: "Transition plan", status: "ready" }, { label: "Support note", status: "pending" }],
    },
  };

  return {
    ...surfaces[normalizedRole],
    highlights: permissionSet.includes("recommend_actions") || permissionSet.includes("verify_evidence")
      ? [...surfaces[normalizedRole].highlights, "Verification-ready evidence"]
      : surfaces[normalizedRole].highlights,
  };
}

export function getRoutePermissions(pathname?: string | null, role?: string | null, profileMode?: string | null): string[] {
  const normalizedPath = pathname ?? "/";
  const normalizedRole = resolveRoleFromProfile(role || profileMode, resolveRoleFromPathname(normalizedPath));

  if (normalizedPath.startsWith("/permissions") || normalizedPath.startsWith("/admin")) {
    return ["view_cohort", "view_equity_metrics"];
  }

  if (normalizedPath.startsWith("/record") || normalizedPath.startsWith("/scholar-athlete")) {
    return ROLE_PERMISSION_MAP[normalizedRole] ?? ROLE_PERMISSION_MAP.scholar;
  }

  if (normalizedPath.startsWith("/notifications") || normalizedPath.startsWith("/settings")) {
    return ROLE_PERMISSION_MAP[normalizedRole] ?? ROLE_PERMISSION_MAP.scholar;
  }

  return ROLE_PERMISSION_MAP[normalizedRole] ?? ROLE_PERMISSION_MAP.scholar;
}

function resolveRoleFromProfile(role?: string | null, fallback: RoleShellRole = "scholar"): RoleShellRole {
  if (!role) return fallback;

  const key = String(role).trim().toLowerCase();
  const aliasMap: Record<string, RoleShellRole> = {
    scholar: "scholar",
    student: "scholar",
    learner: "scholar",
    "scholar-athlete": "scholar-athlete",
    athlete: "scholar-athlete",
    mentor: "mentor",
    founder: "founder",
    admin: "founder",
    parent: "family",
    guardian: "family",
    family: "family",
    educator: "educator",
    teacher: "educator",
    coach: "coach",
    "high-school-coach": "coach",
    "brand-partner": "brand-partner",
    brandpartner: "brand-partner",
    "college-coach": "college-coach",
    recruiter: "college-coach",
    "college-admissions": "college-admissions",
    admissions: "college-admissions",
    employer: "employer",
    district: "district",
    "transition-youth": "transition-youth",
    tay: "transition-youth",
  };

  return aliasMap[key] ?? fallback;
}
