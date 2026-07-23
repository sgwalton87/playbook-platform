/**
 * ==========================================================
 * PLAYBOOK OS
 * Shadow & Elevation System
 * Codename: RUN IT
 * ==========================================================
 *
 * Shadows communicate elevation and hierarchy.
 * Keep them soft, subtle, and consistent.
 * Avoid stacking multiple shadow levels on a single component.
 */

export const SHADOWS = {
  none: "none",

  xs: "0 1px 2px rgba(15, 23, 42, 0.04)",

  sm: "0 2px 8px rgba(15, 23, 42, 0.06)",

  md: "0 6px 18px rgba(15, 23, 42, 0.08)",

  lg: "0 12px 32px rgba(15, 23, 42, 0.10)",

  xl: "0 20px 48px rgba(15, 23, 42, 0.12)",

  floating: "0 24px 64px rgba(15, 23, 42, 0.16)",

  inset: "inset 0 1px 3px rgba(15, 23, 42, 0.08)",

  focus: "0 0 0 4px rgba(37, 99, 235, 0.18)",
} as const;

/**
 * Component shadow defaults.
 */

export const COMPONENT_SHADOWS = {
  card: SHADOWS.sm,

  cardHover: SHADOWS.md,

  button: SHADOWS.xs,

  buttonHover: SHADOWS.sm,

  dropdown: SHADOWS.lg,

  modal: SHADOWS.floating,

  drawer: SHADOWS.floating,

  tooltip: SHADOWS.md,

  hero: SHADOWS.lg,
} as const;

/**
 * Elevation levels for reusable surfaces.
 */

export const ELEVATION = {
  0: SHADOWS.none,
  1: SHADOWS.xs,
  2: SHADOWS.sm,
  3: SHADOWS.md,
  4: SHADOWS.lg,
  5: SHADOWS.xl,
} as const;

export type ShadowToken = keyof typeof SHADOWS;
export type ComponentShadowToken = keyof typeof COMPONENT_SHADOWS;
export type ElevationLevel = keyof typeof ELEVATION;
