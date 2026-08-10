export type Permission =
  | "view_progress"
  | "view_verified_record"
  | "view_deadlines"
  | "support_tasks"
  | "verify_evidence"
  | "recommend_actions"
  | "view_cohort"
  | "view_equity_metrics"
  | "create_opportunities"
  | "review_candidates";

export type RelationshipKind =
  | "scholar"
  | "parent_guardian"
  | "educator"
  | "mentor"
  | "district_admin"
  | "university_partner"
  | "employer_partner";

export function getPermissionsForRelationship(kind: RelationshipKind): Permission[] {
  const map: Record<RelationshipKind, Permission[]> = {
    scholar: ["view_progress", "view_verified_record", "view_deadlines", "support_tasks"],
    parent_guardian: ["view_progress", "view_deadlines", "support_tasks"],
    educator: ["view_progress", "verify_evidence", "recommend_actions", "view_cohort"],
    mentor: ["view_progress", "recommend_actions", "support_tasks"],
    district_admin: ["view_cohort", "view_equity_metrics"],
    university_partner: ["view_verified_record", "recommend_actions"],
    employer_partner: ["view_verified_record", "create_opportunities", "review_candidates"],
  };

  return map[kind];
}

export function canRelationship(kind: RelationshipKind, permission: Permission) {
  return getPermissionsForRelationship(kind).includes(permission);
}

export function getRelationshipGraph() {
  return [
    { name: "Scholar", relationship: "scholar", permissions: getPermissionsForRelationship("scholar") },
    { name: "Parent / Guardian", relationship: "parent_guardian", permissions: getPermissionsForRelationship("parent_guardian") },
    { name: "Ms. Rivera", relationship: "educator", permissions: getPermissionsForRelationship("educator") },
    { name: "Coach Taylor", relationship: "mentor", permissions: getPermissionsForRelationship("mentor") },
    { name: "District Success Team", relationship: "district_admin", permissions: getPermissionsForRelationship("district_admin") },
    { name: "University Outreach", relationship: "university_partner", permissions: getPermissionsForRelationship("university_partner") },
    { name: "Workforce Partner", relationship: "employer_partner", permissions: getPermissionsForRelationship("employer_partner") },
  ];
}
