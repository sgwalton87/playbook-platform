/**
 * ==========================================================
 * PLAYBOOK OS
 * Z-Index System
 * Codename: RUN IT
 * ==========================================================
 *
 * Never use arbitrary z-index values.
 *
 * Import these tokens instead.
 */

export const Z_INDEX = {
  base: 0,

  content: 10,

  sticky: 100,

  header: 200,

  sidebar: 300,

  overlay: 400,

  dropdown: 500,

  popover: 600,

  tooltip: 700,

  drawer: 800,

  modalBackdrop: 900,

  modal: 1000,

  toast: 1100,

  notification: 1200,

  commandPalette: 1300,

  coachCorner: 1400,

  celebration: 1500,

  debug: 9999,
} as const;

/**
 * Layer groupings.
 */

export const LAYERS = {
  navigation: Z_INDEX.header,

  floatingUI: Z_INDEX.dropdown,

  dialogs: Z_INDEX.modal,

  notifications: Z_INDEX.toast,

  celebrations: Z_INDEX.celebration,
} as const;

export type ZIndexToken = keyof typeof Z_INDEX;
