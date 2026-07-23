/**
 * ==========================================================
 * PLAYBOOK OS
 * Theme Configuration
 * Codename: RUN IT
 * ==========================================================
 *
 * A theme is simply a collection of design tokens.
 * Components should import THEME instead of individual token files.
 */

import { COLORS, GRADIENTS, ROLE_COLORS } from "./colors";
import { SPACE, SPACING, LAYOUT_SPACING } from "./spacing";
import { RADIUS, COMPONENT_RADIUS } from "./radius";
import { SHADOWS, COMPONENT_SHADOWS, ELEVATION } from "./shadows";
import {
  FONT_FAMILY,
  FONT_WEIGHT,
  LINE_HEIGHT,
  LETTER_SPACING,
  TYPE,
} from "./typography";
import {
  DURATION,
  EASING,
  TRANSITIONS,
  HOVER,
  ANIMATION,
} from "./motion";
import {
  BREAKPOINTS,
  MEDIA,
  CONTAINER,
  GRID,
  NAVIGATION,
} from "./breakpoints";
import { Z_INDEX, LAYERS } from "./zIndex";

export const THEME = {
  name: "Playbook OS",

  colors: COLORS,

  gradients: GRADIENTS,

  roleColors: ROLE_COLORS,

  spacing: SPACING,

  space: SPACE,

  layout: LAYOUT_SPACING,

  radius: RADIUS,

  componentRadius: COMPONENT_RADIUS,

  shadows: SHADOWS,

  componentShadows: COMPONENT_SHADOWS,

  elevation: ELEVATION,

  typography: TYPE,

  fontFamily: FONT_FAMILY,

  fontWeight: FONT_WEIGHT,

  lineHeight: LINE_HEIGHT,

  letterSpacing: LETTER_SPACING,

  duration: DURATION,

  easing: EASING,

  transitions: TRANSITIONS,

  hover: HOVER,

  animation: ANIMATION,

  breakpoints: BREAKPOINTS,

  media: MEDIA,

  container: CONTAINER,

  navigation: NAVIGATION,

  grid: GRID,

  zIndex: Z_INDEX,

  layers: LAYERS,
} as const;

export type PlaybookTheme = typeof THEME;

export default THEME;
