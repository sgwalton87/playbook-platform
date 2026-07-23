/**
 * ==========================================================
 * PLAYBOOK OS
 * Motion System
 * Codename: RUN IT
 * ==========================================================
 *
 * Motion should communicate state, hierarchy, and momentum.
 * It should never feel distracting or slow.
 */

export const DURATION = {
  instant: "75ms",

  fast: "150ms",

  normal: "250ms",

  slow: "400ms",

  slower: "600ms",
} as const;

export const EASING = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",

  enter: "cubic-bezier(0, 0, 0.2, 1)",

  exit: "cubic-bezier(0.4, 0, 1, 1)",

  emphasized: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

/**
 * Standard transitions used throughout Playbook OS.
 */

export const TRANSITIONS = {
  colors: `color ${DURATION.fast} ${EASING.standard},
background-color ${DURATION.fast} ${EASING.standard},
border-color ${DURATION.fast} ${EASING.standard}`,

  shadow: `box-shadow ${DURATION.normal} ${EASING.standard}`,

  transform: `transform ${DURATION.normal} ${EASING.standard}`,

  opacity: `opacity ${DURATION.fast} ${EASING.standard}`,

  all: `all ${DURATION.normal} ${EASING.standard}`,
} as const;

/**
 * Hover transforms.
 */

export const HOVER = {
  card: "translateY(-4px)",

  button: "translateY(-2px)",

  icon: "scale(1.05)",

  image: "scale(1.02)",

  none: "none",
} as const;

/**
 * Animation presets.
 */

export const ANIMATION = {
  fadeIn: {
    opacity: [0, 1],
  },

  slideUp: {
    opacity: [0, 1],
    transform: ["translateY(16px)", "translateY(0px)"],
  },

  slideDown: {
    opacity: [0, 1],
    transform: ["translateY(-16px)", "translateY(0px)"],
  },

  slideLeft: {
    opacity: [0, 1],
    transform: ["translateX(16px)", "translateX(0px)"],
  },

  slideRight: {
    opacity: [0, 1],
    transform: ["translateX(-16px)", "translateX(0px)"],
  },

  scaleIn: {
    opacity: [0, 1],
    transform: ["scale(.96)", "scale(1)"],
  },
} as const;

/**
 * Respect reduced-motion accessibility preferences.
 */

export const REDUCED_MOTION = {
  transition: "none",
  animation: "none",
} as const;

export type DurationToken = keyof typeof DURATION;
export type EasingToken = keyof typeof EASING;
export type TransitionToken = keyof typeof TRANSITIONS;
