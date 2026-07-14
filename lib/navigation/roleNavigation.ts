export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export type RoleNavigation = {
  home: string;
  label: string;
  items: NavItem[];
};

const SHARED_PROFILE: NavItem = {
  label: "Profile",
  href: "/profile",
  icon: "👤",
};

const SHARED_MESSAGES: NavItem = {
  label: "Messages",
  href: "/messages",
  icon: "💬",
};

const SHARED_COURSES: NavItem = {
  label: "Courses",
  href: "/courses",
  icon: "🎓",
};

const SHARED_OPPORTUNITIES: NavItem = {
  label: "Opportunities",
  href: "/opportunities",
  icon: "🚀",
};

export const ROLE_NAVIGATION: Record<string, RoleNavigation> = {
  scholar: {
    home: "/dashboard",
    label: "Scholar OS",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "🏠" },
      { label: "Start Here", href: "/start", icon: "▶️" },
      { label: "Transcript", href: "/transcript", icon: "📄" },
      {
        label: "Academic Readiness",
        href: "/academic-readiness",
        icon: "📚",
      },
      { label: "Compass", href: "/compass", icon: "🧭" },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  "scholar-athlete": {
    home: "/scholar-athlete-os",
    label: "Scholar-Athlete OS",
    items: [
      {
        label: "Athlete Dashboard",
        href: "/scholar-athlete-os",
        icon: "🏆",
      },
      { label: "Start Here", href: "/start", icon: "▶️" },
      { label: "Transcript", href: "/transcript", icon: "📄" },
      {
        label: "Academic Readiness",
        href: "/academic-readiness",
        icon: "📚",
      },
      { label: "Compass", href: "/compass", icon: "🧭" },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  "brand-partner": {
    home: "/brand-partner-os",
    label: "Brand Partner OS",
    items: [
      {
        label: "Partner Dashboard",
        href: "/brand-partner-os",
        icon: "🤝",
      },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  family: {
    home: "/family-os",
    label: "Family OS",
    items: [
      {
        label: "Family Dashboard",
        href: "/family-os",
        icon: "🏠",
      },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  mentor: {
    home: "/mentor-os",
    label: "Mentor OS",
    items: [
      {
        label: "Mentor Dashboard",
        href: "/mentor-os",
        icon: "🧭",
      },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  educator: {
    home: "/educator-os",
    label: "Educator OS",
    items: [
      {
        label: "Educator Dashboard",
        href: "/educator-os",
        icon: "🍎",
      },
      {
        label: "Academic Readiness",
        href: "/academic-readiness",
        icon: "📚",
      },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  coach: {
    home: "/mentor-os",
    label: "Coach OS",
    items: [
      {
        label: "Coach Dashboard",
        href: "/mentor-os",
        icon: "📋",
      },
      {
        label: "Academic Readiness",
        href: "/academic-readiness",
        icon: "📚",
      },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  "college-coach": {
    home: "/university-os",
    label: "Recruiting OS",
    items: [
      {
        label: "Recruiting Dashboard",
        href: "/university-os",
        icon: "🔎",
      },
      SHARED_OPPORTUNITIES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  "college-admissions": {
    home: "/university-os",
    label: "Admissions OS",
    items: [
      {
        label: "Admissions Dashboard",
        href: "/university-os",
        icon: "🏛️",
      },
      SHARED_OPPORTUNITIES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  "transition-youth": {
    home: "/dashboard",
    label: "TAY OS",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "🏠" },
      { label: "Start Here", href: "/start", icon: "▶️" },
      { label: "Compass", href: "/compass", icon: "🧭" },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  employer: {
    home: "/employer-os",
    label: "Employer OS",
    items: [
      {
        label: "Employer Dashboard",
        href: "/employer-os",
        icon: "💼",
      },
      SHARED_OPPORTUNITIES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  other: {
    home: "/dashboard",
    label: "Playbook",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "🏠" },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },
};

export function normalizeNavigationRole(
  profileMode?: string | null,
  role?: string | null
) {
  const raw = profileMode || role || "scholar";

  const aliases: Record<string, string> = {
    athlete: "scholar-athlete",
    scholar_athlete: "scholar-athlete",
    brand_partner: "brand-partner",
    parent: "family",
    guardian: "family",
    teacher: "educator",
    "high-school-coach": "coach",
    recruiter: "college-coach",
    "admissions-officer": "college-admissions",
    tay: "transition-youth",
  };

  return aliases[raw] || raw;
}

export function getRoleNavigation(
  profileMode?: string | null,
  role?: string | null
): RoleNavigation {
  const normalized = normalizeNavigationRole(profileMode, role);

  return (
    ROLE_NAVIGATION[normalized] ||
    ROLE_NAVIGATION.other
  );
}
