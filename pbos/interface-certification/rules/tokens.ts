import type { InterfaceDomainRule } from "../validator";

export const designTokenRule: InterfaceDomainRule = {
  id: "IC-003",
  name: "Design Token Compliance",
  requiredControls: [
    "spacing_tokens",
    "typography_tokens",
    "color_tokens",
    "theme_tokens",
    "responsive_tokens",
    "token_reuse",
  ],
};
