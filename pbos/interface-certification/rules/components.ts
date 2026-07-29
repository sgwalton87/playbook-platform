import type { InterfaceDomainRule } from "../validator";

export const componentArchitectureRule: InterfaceDomainRule = {
  id: "IC-002",
  name: "Component Architecture Compliance",
  requiredControls: [
    "component_ownership",
    "component_versioning",
    "composition_rules",
    "lifecycle_management",
  ],
};
