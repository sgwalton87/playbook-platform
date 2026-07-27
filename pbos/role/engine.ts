import { digestValue } from "../context";
import type { MultiRoleProfile, RoleDashboard, RoleInput, RoleProvenance, RoleRecord, RoleReport } from "./contracts";
import { ROLE_DEFINITIONS } from "./definitions";
import { routeRoleGovernance } from "./routing";
import { validateRoleInput } from "./validation";

export function createRoleReport(input: RoleInput): RoleReport {
  const context = validateRoleInput(input);
  const roleRecords: RoleRecord[] = input.roleAssignments.map((assignment) => {
    const approval = input.approvals.find((item) => item.personIdentity === assignment.personIdentity && item.roleType === assignment.roleType && item.organizationIdentity === assignment.organizationIdentity && item.approvalScope === "ROLE_VERIFICATION" && item.status === "APPROVED")!;
    const provenance: RoleProvenance = { runtimeContextDigest: context.contextDigest, identityReportId: input.identityReports.find(({ identityState }) => identityState.personReference === assignment.personIdentity)!.reportId, ecosystemReportIds: input.ecosystemReports.map(({ reportId }) => reportId).sort(), authorizationEvidence: [...assignment.authorizationEvidence].sort(), consentId: assignment.consentId, approvalId: approval.approvalId, createdAt: input.generatedAt, authorizedActor: approval.approverIdentity };
    const body = { ...assignment, requestedPermissions: [...assignment.requestedPermissions].sort(), authorizationEvidence: [...assignment.authorizationEvidence].sort(), permissions: [...assignment.requestedPermissions].sort(), state: "ACTIVE" as const, identityBound: true as const, createsAuthority: false as const, permanentIdentityLabel: false as const, provenance };
    return { roleId: `PBOS-ROLE-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
  }).sort((a, b) => a.roleId.localeCompare(b.roleId));
  const dashboards: RoleDashboard[] = roleRecords.map((role) => {
    const definition = ROLE_DEFINITIONS[role.roleType];
    const body = { roleId: role.roleId, roleType: role.roleType, enabledEngines: [...definition.availableEngines].sort(), widgets: [...definition.dashboardComponents], workflows: [...definition.workflows], actions: role.permissions.map((permission) => `ROLE_SCOPED_${permission}`).sort(), notifications: [`${role.roleType}_WORKFLOW_UPDATES`], resources: definition.dashboardComponents.map((component) => `${component} Resources`).sort(), permissions: [...role.permissions], derivedFromRoleAuthority: true as const, crossRolePermissionMerge: false as const };
    return { dashboardId: `PBOS-ROLE-DASH-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
  });
  const people = [...new Set(roleRecords.map(({ personIdentity }) => personIdentity))].sort();
  const multiRoleProfiles: MultiRoleProfile[] = people.map((personIdentity) => {
    const roles = roleRecords.filter((role) => role.personIdentity === personIdentity);
    const roleDashboards = dashboards.filter((dashboard) => roles.some(({ roleId }) => roleId === dashboard.roleId));
    const permissionsByRole = Object.fromEntries(roles.map(({ roleId, permissions }) => [roleId, [...permissions]]));
    const body = { personIdentity, roleIds: roles.map(({ roleId }) => roleId).sort(), dashboards: roleDashboards, permissionsByRole, rolesKeptSeparate: true as const };
    return { profileId: `PBOS-ROLE-PROFILE-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
  });
  const experienceConfigurations = [...new Set(roleRecords.map(({ roleType }) => roleType))].sort().map((roleType) => ROLE_DEFINITIONS[roleType]);
  const evidenceBundle = [...new Set([...input.roleAssignments.flatMap(({ authorizationEvidence }) => authorizationEvidence), ...input.approvals.flatMap(({ evidenceReferences }) => evidenceReferences)])].sort();
  const body = { generatedAt: input.generatedAt, runtimeContextDigest: context.contextDigest, roleRecords, experienceConfigurations, dashboards, multiRoleProfiles, governanceRoutes: routeRoleGovernance(input.approvals.map(({ approvalScope }) => approvalScope)), evidenceBundle, limitations: ["Roles provide scoped experiences and never create institutional or decision authority.", "Permissions, consent, organization access, and multiple roles remain separate and revocable."] };
  return { reportId: `PBOS-ROLE-REPORT-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body };
}
