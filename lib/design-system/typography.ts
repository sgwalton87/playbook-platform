/**
 * ==========================================================
 * PLAYBOOK OS
 * Typography System
 * Codename: RUN IT
 * ==========================================================
 *
 * Typography should feel modern, confident, and highly readable.
 * Use these tokens instead of arbitrary font sizes.
 */

export const FONT_FAMILY = {
  sans: `'Inter', 'SF Pro Display', 'Segoe UI', sans-serif`,
  mono: `'JetBrains Mono', 'SFMono-Regular', monospace`,
} as const;

export const FONT_WEIGHT = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const LINE_HEIGHT = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.7,
} as const;

export const LETTER_SPACING = {
  tighter: "-0.04em",
  tight: "-0.02em",
  normal: "0",
  wide: "0.02em",
  wider: "0.05em",
} as const;

/**
 * Playbook OS Type Scale
 */

export const TYPE = {
  displayXL: {
    fontSize: "64px",
    lineHeight: LINE_HEIGHT.tight,
    fontWeight: FONT_WEIGHT.extrabold,
    letterSpacing: LETTER_SPACING.tighter,
  },

  displayLG: {
    fontSize: "52px",
    lineHeight: LINE_HEIGHT.tight,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: LETTER_SPACING.tight,
  },

  headingXL: {
    fontSize: "40px",
    lineHeight: LINE_HEIGHT.snug,
    fontWeight: FONT_WEIGHT.bold,
  },

  headingLG: {
    fontSize: "32px",
    lineHeight: LINE_HEIGHT.snug,
    fontWeight: FONT_WEIGHT.bold,
  },

  headingMD: {
    fontSize: "24px",
    lineHeight: LINE_HEIGHT.snug,
    fontWeight: FONT_WEIGHT.semibold,
  },

  headingSM: {
    fontSize: "20px",
    lineHeight: LINE_HEIGHT.normal,
    fontWeight: FONT_WEIGHT.semibold,
  },

  bodyLG: {
    fontSize: "18px",
    lineHeight: LINE_HEIGHT.relaxed,
    fontWeight: FONT_WEIGHT.regular,
  },

  body: {
    fontSize: "16px",
    lineHeight: LINE_HEIGHT.normal,
    fontWeight: FONT_WEIGHT.regular,
  },

  bodySM: {
    fontSize: "14px",
    lineHeight: LINE_HEIGHT.normal,
    fontWeight: FONT_WEIGHT.regular,
  },

  caption: {
    fontSize: "12px",
    lineHeight: LINE_HEIGHT.normal,
    fontWeight: FONT_WEIGHT.medium,
  },

  label: {
    fontSize: "13px",
    lineHeight: LINE_HEIGHT.normal,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: LETTER_SPACING.wide,
  },

  overline: {
    fontSize: "11px",
    lineHeight: LINE_HEIGHT.normal,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: LETTER_SPACING.wider,
    textTransform: "uppercase" as const,
  },
} as const;

export type TypographyToken = keyof typeof TYPE;
