import type { RoleExperienceDefinition, RolePermission, RoleType } from "./contracts";

const baseRestrictions = [
  { code: "NO_AUTHORITY_CREATION", description: "Role assignment does not create institutional or decision authority." },
  { code: "CONSENT_REQUIRED", description: "Private data access requires active, purpose-specific consent." },
];
const define = (roleType: RoleType, dashboardComponents: string[], availableEngines: string[], workflows: string[], allowedPermissions: RolePermission[], restrictions: RoleExperienceDefinition["restrictions"] = []): RoleExperienceDefinition => ({
  roleType,
  dashboardComponents,
  availableEngines,
  workflows,
  allowedPermissions,
  restrictions: [...baseRestrictions, ...restrictions],
});

export const ROLE_DEFINITIONS: Record<RoleType, RoleExperienceDefinition> = {
  SCHOLAR: define("SCHOLAR", ["Compass", "Academics", "Portfolio", "Opportunities", "Goals", "Mentorship"], ["IDENTITY", "ACADEMIC", "PORTFOLIO", "COMPASS", "OPPORTUNITY"], ["review-goals", "track-academics", "curate-portfolio", "explore-opportunities"], ["VIEW", "CONNECT", "SHARE", "EXPORT", "REVOKE"]),
  SCHOLAR_ATHLETE: define("SCHOLAR_ATHLETE", ["Scholar", "Athletic Development", "Recruiting", "Performance Portfolio", "Mobility"], ["IDENTITY", "ACADEMIC", "ATHLETICS", "PORTFOLIO", "COMPASS", "OPPORTUNITY"], ["track-academics", "review-athletic-evidence", "explore-recruiting", "prepare-mobility"], ["VIEW", "CONNECT", "SHARE", "EXPORT", "REVOKE"]),
  PARENT_GUARDIAN: define("PARENT_GUARDIAN", ["Support Visibility", "Milestones", "Resources", "Communication"], ["ECOSYSTEM", "COMPASS", "ACADEMIC"], ["review-consented-milestones", "find-resources", "communicate"], ["VIEW", "CONNECT"], [{ code: "STUDENT_CONSENT", description: "Student consent limits all visibility." }]),
  MENTOR: define("MENTOR", ["Mentees", "Guidance", "Check-ins", "Impact"], ["ECOSYSTEM", "COMPASS"], ["support-check-in", "offer-guidance", "record-impact"], ["VIEW", "CONNECT", "MENTOR"], [{ code: "NO_MENTEE_DECISIONS", description: "Mentors cannot decide for mentees." }]),
  COACH: define("COACH", ["Athlete Development", "Communication", "Performance Support"], ["ATHLETICS", "ECOSYSTEM"], ["support-development", "communicate", "review-consented-evidence"], ["VIEW", "CONNECT", "MENTOR"], [{ code: "NO_OUTCOME_DECISIONS", description: "Coaches cannot determine recruiting or performance outcomes." }]),
  TEACHER: define("TEACHER", ["Learning Support", "Student Progress", "Recommendations"], ["LEARNING", "ACADEMIC"], ["support-learning", "review-consented-progress", "recommend-resources"], ["VIEW", "CONNECT", "MENTOR"]),
  COUNSELOR: define("COUNSELOR", ["Academic Guidance", "Pathways", "Student Planning"], ["ACADEMIC", "COMPASS", "OPPORTUNITY"], ["review-pathways", "support-planning", "identify-resources"], ["VIEW", "CONNECT", "MENTOR"]),
  COLLEGE_REPRESENTATIVE: define("COLLEGE_REPRESENTATIVE", ["Programs", "Opportunities", "Outreach"], ["OPPORTUNITY", "ECOSYSTEM"], ["publish-verified-programs", "consented-outreach"], ["VIEW", "CONNECT", "MANAGE"], [{ code: "NO_PRIVATE_STUDENT_ACCESS", description: "Private student data requires permission." }]),
  EMPLOYER: define("EMPLOYER", ["Opportunities", "Workforce Pathways", "Talent Engagement"], ["OPPORTUNITY", "ECOSYSTEM"], ["publish-opportunities", "consented-engagement"], ["VIEW", "CONNECT", "MANAGE"], [{ code: "NO_RANKING_OR_DISCRIMINATION", description: "Employers cannot rank or discriminate through PBOS." }]),
  FINANCIAL_PROFESSIONAL: define("FINANCIAL_PROFESSIONAL", ["Financial Education", "Approved Support"], ["ECOSYSTEM", "COMPASS"], ["share-approved-education", "consented-support"], ["VIEW", "CONNECT"], [{ code: "NO_UNAUTHORIZED_FINANCIAL_ACCESS", description: "Private financial data requires authorization." }]),
  COMMUNITY_LEADER: define("COMMUNITY_LEADER", ["Programs", "Resources", "Community Opportunities"], ["ECOSYSTEM", "OPPORTUNITY"], ["publish-programs", "share-resources"], ["VIEW", "CONNECT", "MANAGE"]),
  FOUNDER: define("FOUNDER", ["Entrepreneurship", "Business Development", "Portfolio"], ["PORTFOLIO", "OPPORTUNITY", "COMPASS"], ["build-portfolio", "explore-pathways", "find-support"], ["VIEW", "CONNECT", "SHARE", "EXPORT"]),
  ORGANIZATION_PARTNER: define("ORGANIZATION_PARTNER", ["Programs", "Cohorts", "Partnerships"], ["ECOSYSTEM", "OPPORTUNITY"], ["manage-approved-programs", "coordinate-cohorts", "review-partnerships"], ["VIEW", "CONNECT", "MANAGE", "ADMINISTER"], [{ code: "APPROVED_SCOPE_ONLY", description: "Organization administration is limited to approved scope." }]),
};
