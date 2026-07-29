import type { InterfaceDomainRule } from "../validator";

export const performanceRule: InterfaceDomainRule = {
  id: "IC-008",
  name: "Performance and Observability Compliance",
  requiredControls: [
    "performance_expectations",
    "analytics_requirements",
    "error_monitoring",
    "user_behavior_understanding",
    "system_health_visibility",
  ],
};
