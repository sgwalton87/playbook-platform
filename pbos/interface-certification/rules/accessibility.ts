import type { InterfaceDomainRule } from "../validator";

export const accessibilityRule: InterfaceDomainRule = {
  id: "IC-004",
  name: "Accessibility Compliance",
  requiredControls: [
    "wcag_alignment",
    "keyboard_navigation",
    "screen_reader_support",
    "cognitive_accessibility",
    "inclusive_interaction",
  ],
};
