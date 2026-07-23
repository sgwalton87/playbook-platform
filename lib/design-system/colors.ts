/**
 * ==========================================================
 * PLAYBOOK OS
 * Color System
 * Codename: RUN IT
 * ==========================================================
 */

export const COLORS = {
  // Brand
  navy: "#0F172A",
  royal: "#2563EB",
  brightBlue: "#3B82F6",
  orange: "#F97316",

  // Neutrals
  cream: "#FAF7F2",
  white: "#FFFFFF",

  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate500: "#64748B",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1E293B",
  slate900: "#0F172A",

  // Semantic
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#DC2626",
  info: "#2563EB",

  // Borders
  border: "#E5E7EB",

  // Backgrounds
  background: "#FAF7F2",
  surface: "#FFFFFF",
  mutedSurface: "#F8FAFC",

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  textInverse: "#FFFFFF",
} as const;

export const GRADIENTS = {
  hero:
    "linear-gradient(135deg, #0F172A 0%, #1E3A8A 55%, #2563EB 100%)",

  action:
    "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)",

  success:
    "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)",

  warning:
    "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
} as const;

export const ROLE_COLORS = {
  scholar: "#2563EB",
  scholar_athlete: "#F97316",
  parent_guardian: "#22C55E",
  teacher_educator: "#7C3AED",
  high_school_counselor: "#EC4899",
  mentor: "#14B8A6",
  high_school_coach: "#DC2626",
  college_coach_recruiter: "#0EA5E9",
  college_admissions: "#0369A1",
  employer_workforce_partner: "#0F766E",
  brand_partner: "#9333EA",
  district_school_administrator: "#475569",
  transition_aged_youth: "#D97706",
  athlete_abroad: "#0891B2",
  founder: "#111827",
} as const;

export type ColorToken = keyof typeof COLORS;
export type RoleColorToken = keyof typeof ROLE_COLORS;
