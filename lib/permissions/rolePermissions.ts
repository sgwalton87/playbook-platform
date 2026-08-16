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
  | "counselor"
  | "mentor"
  | "coach"
  | "district_admin"
  | "college_recruiter"
  | "college_admissions"
  | "community_partner"
  | "university_partner"
  | "employer_partner";

export function getPermissionsForRelationship(kind: RelationshipKind): Permission[] {
  const map: Record<RelationshipKind, Permission[]> = {
    scholar: ["view_progress", "view_verified_record", "view_deadlines", "support_tasks"],
    parent_guardian: ["view_progress", "view_deadlines", "support_tasks"],
    // Relationship identity is not equivalent to role authority. External and
    // institutional relationship identities remain zero-data until their
    // independent verification/scope contracts explicitly activate permissions.
    educator: [],
    counselor: [],
    mentor: ["view_progress", "recommend_actions", "support_tasks"],
    coach: [],
    district_admin: [],
    college_recruiter: [],
    college_admissions: [],
    community_partner: [],
    // Legacy compatibility identity. New invitations must use the exact
    // Recruiting or Admissions relationship instead.
    university_partner: [],
    employer_partner: [],
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
    { name: "Educator", relationship: "educator", permissions: getPermissionsForRelationship("educator") },
    { name: "High School Counselor", relationship: "counselor", permissions: getPermissionsForRelationship("counselor") },
    { name: "Mentor", relationship: "mentor", permissions: getPermissionsForRelationship("mentor") },
    { name: "Coach", relationship: "coach", permissions: getPermissionsForRelationship("coach") },
    { name: "District Administrator", relationship: "district_admin", permissions: getPermissionsForRelationship("district_admin") },
    { name: "College Coach / Recruiter", relationship: "college_recruiter", permissions: getPermissionsForRelationship("college_recruiter") },
    { name: "College Admissions", relationship: "college_admissions", permissions: getPermissionsForRelationship("college_admissions") },
    { name: "Community Partner", relationship: "community_partner", permissions: getPermissionsForRelationship("community_partner") },
    { name: "Legacy University Partner", relationship: "university_partner", permissions: getPermissionsForRelationship("university_partner") },
    { name: "Employer Partner", relationship: "employer_partner", permissions: getPermissionsForRelationship("employer_partner") },
  ];
}
