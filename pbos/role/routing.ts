import type { RoleApproval } from "./contracts";
const routes: Record<RoleApproval["approvalScope"], string> = { ROLE_VERIFICATION: "human-role-verifier", ORGANIZATION_ACCESS: "organization-authority", ELEVATED_PERMISSION: "permission-governance", ADMINISTRATIVE_PRIVILEGE: "administrative-governance" };
export const routeRoleGovernance = (scopes: RoleApproval["approvalScope"][]): string[] => [...new Set(scopes.map((scope) => routes[scope]))].sort();
