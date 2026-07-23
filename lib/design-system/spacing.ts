/**
 * ==========================================================
 * PLAYBOOK OS
 * Spacing System
 * Codename: RUN IT
 * ==========================================================
 *
 * The spacing scale is based on a 4px foundation.
 * New Playbook OS components should use these tokens instead
 * of introducing arbitrary margin, padding, or gap values.
 */

export const SPACING = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

/**
 * CSS-ready spacing values.
 *
 * Example:
 * padding: SPACE.md
 * gap: SPACE.lg
 */
export const SPACE = {
  none: "0px",
  xxs: "4px",
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "40px",
  "3xl": "48px",
  "4xl": "64px",
  "5xl": "80px",
  "6xl": "96px",
} as const;

/**
 * Standard layout spacing used across major Playbook surfaces.
 */
export const LAYOUT_SPACING = {
  pageInlineMobile: SPACE.md,
  pageInlineTablet: SPACE.lg,
  pageInlineDesktop: SPACE.xl,

  pageBlockMobile: SPACE.lg,
  pageBlockDesktop: SPACE["3xl"],

  sectionGap: SPACE["3xl"],
  contentGap: SPACE.lg,
  cardGap: SPACE.md,
  fieldGap: SPACE.md,

  sidebarWidth: "280px",
  sidebarCollapsedWidth: "88px",
  headerHeight: "72px",

  contentMaxWidth: "1440px",
  readingMaxWidth: "760px",
  formMaxWidth: "680px",
} as const;

export type SpacingToken = keyof typeof SPACING;
export type SpaceToken = keyof typeof SPACE;
export type LayoutSpacingToken = keyof typeof LAYOUT_SPACING;
