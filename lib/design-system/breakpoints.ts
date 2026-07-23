/**
 * ==========================================================
 * PLAYBOOK OS
 * Responsive Breakpoints
 * Codename: RUN IT
 * ==========================================================
 *
 * Mobile First.
 * Every Playbook OS experience begins on mobile and scales up.
 */

export const BREAKPOINTS = {
  xs: 0,

  sm: 480,

  md: 768,

  lg: 1024,

  xl: 1280,

  "2xl": 1536,
} as const;

/**
 * CSS Media Queries
 */

export const MEDIA = {
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,

  md: `(min-width: ${BREAKPOINTS.md}px)`,

  lg: `(min-width: ${BREAKPOINTS.lg}px)`,

  xl: `(min-width: ${BREAKPOINTS.xl}px)`,

  "2xl": `(min-width: ${BREAKPOINTS["2xl"]}px)`,
} as const;

/**
 * Layout widths
 */

export const CONTAINER = {
  mobile: "100%",

  tablet: "720px",

  laptop: "1024px",

  desktop: "1280px",

  wide: "1440px",
} as const;

/**
 * Navigation behavior
 */

export const NAVIGATION = {
  mobileBreakpoint: BREAKPOINTS.md,

  collapseSidebarBelow: BREAKPOINTS.lg,

  showDesktopSidebarAbove: BREAKPOINTS.lg,
} as const;

/**
 * Grid defaults
 */

export const GRID = {
  mobileColumns: 1,

  tabletColumns: 2,

  desktopColumns: 12,

  gutter: "24px",
} as const;

export type BreakpointToken = keyof typeof BREAKPOINTS;
