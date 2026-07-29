import type { InterfaceDomainRule } from "../validator";

export const designSystemRule: InterfaceDomainRule = {
  id: "IC-001",
  name: "Design System Compliance",
  requiredControls: [
    "approved_design_system_usage",
    "visual_consistency",
    "component_reuse",
    "prohibited_duplication_absent",
  ],
};
