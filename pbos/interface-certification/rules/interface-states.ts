import type { InterfaceDomainRule } from "../validator";

export const interfaceStateRule: InterfaceDomainRule = {
  id: "IC-007",
  name: "Interface State Compliance",
  requiredControls: [
    "loading",
    "empty",
    "success",
    "failure",
    "recovery",
    "permission",
    "offline",
  ],
};
