export const SCHOLAR_PRIMARY_NAV = [
  { label: "Start Here", href: "/start", icon: "✦" },
  { label: "Events", href: "/community-events", icon: "◍" },
  { label: "Mentors", href: "/mentor-connect", icon: "◌" },
  { label: "Albums", href: "/albums", icon: "▧" },
  { label: "Community", href: "/feed", icon: "✺" },
  { label: "My Record", href: "/record", icon: "◈" },
  { label: "Academic Readiness", href: "/academic-readiness", icon: "◎" },
  { label: "Scholar-Athlete", href: "/scholar-athlete-os", icon: "★" },
  { label: "Opportunities", href: "/opportunities", icon: "↗" },
  { label: "Applications", href: "/opportunity-toolkit", icon: "▤" },
  { label: "Support Network", href: "/support-network", icon: "∞" },
  { label: "Messages", href: "/messages", icon: "◇" },
  { label: "Courses", href: "/courses", icon: "△" },
  { label: "Rewards", href: "/reward-economy", icon: "◆" },
];

export const FOUNDER_NAV = [
  { label: "Founder Home", href: "/founder", icon: "◉" },
  { label: "Studio", href: "/studio", icon: "⌘" },
  { label: "Beta Audit", href: "/studio/beta-34-audit", icon: "✓" },
  { label: "Demo Mode", href: "/demo", icon: "▶" },
];

export function getNavigationForRole(role?: string | null) {
  const normalized = (role || "").toLowerCase();

  if (["founder", "admin", "super_admin"].includes(normalized)) {
    return {
      primary: SCHOLAR_PRIMARY_NAV,
      founder: FOUNDER_NAV,
    };
  }

  return {
    primary: SCHOLAR_PRIMARY_NAV,
    founder: [],
  };
}
