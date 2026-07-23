/**
 * ==========================================================
 * PLAYBOOK OS
 * Border Radius System
 * Codename: RUN IT
 * ==========================================================
 *
 * Rounded corners are a core part of the Playbook OS identity.
 * Every component should use these tokens instead of hard-coded values.
 */

export const RADIUS = {
  none: "0px",

  xs: "4px",

  sm: "8px",

  md: "12px",

  lg: "16px",

  xl: "20px",

  "2xl": "24px",

  "3xl": "32px",

  full: "9999px",
} as const;

/**
 * Component defaults
 */

export const COMPONENT_RADIUS = {
  button: RADIUS.lg,

  input: RADIUS.lg,

  textarea: RADIUS.lg,

  select: RADIUS.lg,

  checkbox: RADIUS.sm,

  radio: RADIUS.full,

  badge: RADIUS.full,

  chip: RADIUS.full,

  avatar: RADIUS.full,

  card: RADIUS.xl,

  modal: RADIUS["2xl"],

  drawer: RADIUS["2xl"],

  hero: RADIUS["2xl"],

  image: RADIUS.xl,
} as const;

export type RadiusToken = keyof typeof RADIUS;
export type ComponentRadiusToken = keyof typeof COMPONENT_RADIUS;
