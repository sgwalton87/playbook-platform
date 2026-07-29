import type { InterfaceDomainRule } from "../validator";

export const responsiveRule: InterfaceDomainRule = {
  id: "IC-005",
  name: "Responsive and Device Compliance",
  requiredControls: [
    "mobile",
    "tablet",
    "desktop",
    "future_device_compatibility",
    "adaptive_layouts",
  ],
};
