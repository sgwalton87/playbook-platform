import {
  normalizePlaybookRole,
  type PlaybookRole,
} from "@/lib/roles/registry";

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

export const ROLE_NAVIGATION = {
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

  counselor: {
    home: "/educator-os",
    label: "Counselor OS",
    items: [
      { label: "Counselor Dashboard", href: "/educator-os", icon: "🧭" },
      { label: "Academic Readiness", href: "/academic-readiness", icon: "📚" },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  coach: {
    home: "/educator-os",
    label: "Coach OS",
    items: [
      {
        label: "Coach Dashboard",
        href: "/educator-os",
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
    home: "/tay-os",
    label: "TAY OS",
    items: [
      { label: "TAY Dashboard", href: "/tay-os", icon: "🏠" },
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

  district: {
    home: "/district-os",
    label: "District OS",
    items: [
      { label: "District Dashboard", href: "/district-os", icon: "🏫" },
      { label: "Academic Readiness", href: "/academic-readiness", icon: "📚" },
      SHARED_OPPORTUNITIES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  "athlete-abroad": {
    home: "/athlete-abroad-os",
    label: "Athlete Abroad OS",
    items: [
      { label: "Athlete Abroad", href: "/athlete-abroad-os", icon: "🌍" },
      { label: "Academic Readiness", href: "/academic-readiness", icon: "📚" },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },

  other: {
    home: "/pending",
    label: "Playbook",
    items: [
      { label: "Access Status", href: "/pending", icon: "🏠" },
      SHARED_OPPORTUNITIES,
      SHARED_COURSES,
      SHARED_MESSAGES,
      SHARED_PROFILE,
    ],
  },
} satisfies Record<PlaybookRole, RoleNavigation>;

export function normalizeNavigationRole(
  profileMode?: string | null,
  role?: string | null
) {
  return normalizePlaybookRole(profileMode || role);
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
