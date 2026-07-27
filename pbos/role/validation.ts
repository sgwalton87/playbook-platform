import { digestValue, type PBOSRuntimeContext } from "../context";
import type { RoleApproval, RoleAssignmentDraft, RoleInput } from "./contracts";
import { ROLE_DEFINITIONS } from "./definitions";
import { RoleError, roleFailure } from "./errors";

function validContext(context: PBOSRuntimeContext): boolean {
  const body = { ...context };
  delete (body as Partial<PBOSRuntimeContext>).contextDigest;
  return context.documentInventory.length > 0 && context.contextDigest === digestValue(body);
}
function matches(approval: RoleApproval, assignment: RoleAssignmentDraft): boolean {
  return approval.status === "APPROVED" && approval.personIdentity === assignment.personIdentity && approval.roleType === assignment.roleType && approval.organizationIdentity === assignment.organizationIdentity;
}

export function validateRoleInput(input: RoleInput): PBOSRuntimeContext {
  if (!input.runtimeContext || !validContext(input.runtimeContext)) throw new RoleError([roleFailure("INVALID_CONTEXT", "A valid constitutional Runtime Context is required.")]);
  if (input.inferredRoleRequested) throw new RoleError([roleFailure("INFERRED_ROLE", "Roles cannot be inferred from identity or protected characteristics.")]);
  if (input.permissionBypassRequested) throw new RoleError([roleFailure("PERMISSION_BYPASS", "Role permissions cannot bypass explicit grants.")]);
  if (input.authorityCreationRequested) throw new RoleError([roleFailure("AUTHORITY_CREATION", "Role assignment cannot create institutional authority.")]);
  if (input.privacyBypassRequested) throw new RoleError([roleFailure("PRIVACY_VIOLATION", "Role access cannot bypass privacy or consent.")]);
  if (input.institutionalDecisionRequested) throw new RoleError([roleFailure("INSTITUTIONAL_DECISION_PROHIBITED", "Roles cannot make admissions, employment, recruiting, or institutional decisions.")]);
  if (!input.roleAssignments.length || Number.isNaN(Date.parse(input.generatedAt))) throw new RoleError([roleFailure("MISSING_EVIDENCE", "At least one role and a valid timestamp are required.")]);
  const digest = input.runtimeContext.contextDigest;
  const ecosystemEntities = new Set(input.ecosystemReports.flatMap(({ ecosystemEntities }) => ecosystemEntities.map(({ entityId }) => entityId)));
  const ecosystemRelationships = new Map(input.ecosystemReports.flatMap(({ relationships }) => relationships.map((relationship) => [relationship.relationshipId, relationship] as const)));
  const knownEvidence = new Set([
    ...input.identityReports.flatMap(({ provenanceEvidence }) => provenanceEvidence),
    ...input.ecosystemReports.flatMap(({ evidenceBundle }) => evidenceBundle),
    ...input.compassReports.flatMap(({ evidence }) => evidence),
    ...input.academicReports.flatMap(({ evidence }) => evidence),
    ...input.athleticReports.flatMap(({ provenanceBundle }) => provenanceBundle.evidenceReferences),
    ...input.portfolioReports.flatMap(({ provenanceBundle }) => provenanceBundle.evidenceReferences),
    ...input.opportunityReports.flatMap(({ evidenceBundle }) => evidenceBundle),
  ]);
  const uniqueAssignments = new Set<string>();
  for (const assignment of input.roleAssignments) {
    const identity = input.identityReports.find(({ identityState }) => identityState.personReference === assignment.personIdentity);
    if (!input.authorizedPersonIdentities.includes(assignment.personIdentity) || !identity || identity.runtimeContextDigest !== digest || identity.ownershipInformation.ownerIdentity !== assignment.personIdentity) throw new RoleError([roleFailure("UNAUTHORIZED_ACCESS", "Roles require an authorized, person-owned Identity record.")]);
    if (!identity.verificationStatus.some(({ status }) => status === "VERIFIED")) throw new RoleError([roleFailure("INVALID_ROLE", "Role assignment requires verified identity.")]);
    if (assignment.verificationStatus !== "VERIFIED" || !assignment.purpose || Number.isNaN(Date.parse(assignment.requestedAt))) throw new RoleError([roleFailure("INVALID_ROLE", "Roles require verified status, purpose, and request timestamp.")]);
    const key = `${assignment.personIdentity}:${assignment.roleType}:${assignment.organizationIdentity ?? "PERSONAL"}`;
    if (uniqueAssignments.has(key)) throw new RoleError([roleFailure("INVALID_ROLE", "Duplicate role assignments are not allowed.")]);
    uniqueAssignments.add(key);
    const definition = ROLE_DEFINITIONS[assignment.roleType];
    if (!assignment.requestedPermissions.length || assignment.requestedPermissions.some((permission) => !definition.allowedPermissions.includes(permission))) throw new RoleError([roleFailure("INVALID_PERMISSION", "Permissions must be explicit and allowed by the role definition.")]);
    if (!assignment.authorizationEvidence.length || assignment.authorizationEvidence.some((reference) => !knownEvidence.has(reference))) throw new RoleError([roleFailure("MISSING_EVIDENCE", "Role authorization evidence must be traceable.")]);
    const consent = identity.consentHistory.find((item) => item.consentId === assignment.consentId && item.status === "GRANTED" && item.purpose === assignment.purpose && item.authorizedRecipient === (assignment.organizationIdentity ?? assignment.personIdentity) && (!item.expiresAt || Date.parse(item.expiresAt) > Date.parse(input.generatedAt)));
    if (assignment.consentRequired && (!consent || assignment.authorizationEvidence.some((reference) => !consent.evidenceReferences.includes(reference)))) throw new RoleError([roleFailure("MISSING_CONSENT", "Role access requires active, purpose-specific consent and evidence.")]);
    if (assignment.organizationIdentity && !ecosystemEntities.has(assignment.organizationIdentity)) throw new RoleError([roleFailure("UNAUTHORIZED_ACCESS", "Organization access requires a verified Ecosystem entity.")]);
    if (assignment.relationshipId) { const relationship = ecosystemRelationships.get(assignment.relationshipId); if (!relationship || relationship.consentStatus !== "CONSENTED" || assignment.authorizationEvidence.some((reference) => !relationship.evidenceReferences.includes(reference))) throw new RoleError([roleFailure("PRIVACY_VIOLATION", "Organization relationships require consented relationship evidence.")]); }
    const approvals = input.approvals.filter((approval) => matches(approval, assignment));
    if (!approvals.some(({ approvalScope }) => approvalScope === "ROLE_VERIFICATION")) throw new RoleError([roleFailure("GOVERNANCE_BYPASS", "Human role-verification approval is required.")]);
    if (assignment.organizationIdentity && !approvals.some(({ approvalScope }) => approvalScope === "ORGANIZATION_ACCESS")) throw new RoleError([roleFailure("GOVERNANCE_BYPASS", "Organization access approval is required.")]);
    for (const permission of assignment.requestedPermissions) {
      if (!approvals.some((approval) => approval.approvedPermissions.includes(permission))) throw new RoleError([roleFailure("PERMISSION_BYPASS", "Every permission must appear in an applicable approval.")]);
      if (["MANAGE", "ADMINISTER"].includes(permission) && !approvals.some(({ approvalScope }) => approvalScope === (permission === "ADMINISTER" ? "ADMINISTRATIVE_PRIVILEGE" : "ELEVATED_PERMISSION"))) throw new RoleError([roleFailure("GOVERNANCE_BYPASS", "Elevated and administrative permissions require scoped human approval.")]);
    }
  }
  const reports = [...input.compassReports, ...input.academicReports, ...input.athleticReports, ...input.portfolioReports, ...input.opportunityReports, ...input.ecosystemReports];
  if (reports.some((report) => report.runtimeContextDigest !== digest)) throw new RoleError([roleFailure("PRIVACY_VIOLATION", "Role inputs must share the active Runtime Context.")]);
  return input.runtimeContext;
}
