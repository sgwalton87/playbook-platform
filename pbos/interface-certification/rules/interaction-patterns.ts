import type { InterfaceDomainRule } from "../validator";

export const interactionPatternRule: InterfaceDomainRule = {
  id: "IC-006",
  name: "Interaction Pattern Compliance",
  requiredControls: [
    "approved_interaction_patterns",
    "navigation_consistency",
    "feedback_behavior",
    "user_decision_support",
  ],
};
