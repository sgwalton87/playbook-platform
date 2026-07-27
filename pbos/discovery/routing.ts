import type { DiscoveryChangeType } from "./governed-contracts";

const approvals: Record<DiscoveryChangeType, string[]> = {
  investigation: [], strategic: ["strategic-governance"], constitutional: ["constitutional-governance"],
  policy: ["policy-governance"], resource: ["resource-owner"], architecture: ["architecture-governance"], external: ["external-commitment-authority"],
};
export const requiredDiscoveryApprovals = (changeType: DiscoveryChangeType): string[] => [...approvals[changeType]];
