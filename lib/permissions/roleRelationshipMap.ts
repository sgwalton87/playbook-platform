import type { PlaybookRoleOS } from "@/lib/role-os";
import type { RelationshipKind } from "./rolePermissions";

export function mapRoleToRelationship(role: PlaybookRoleOS): RelationshipKind {
  const map: Partial<Record<PlaybookRoleOS, RelationshipKind>> = {
    learner: "scholar",
    family: "parent_guardian",
    educator: "educator",
    counselor: "counselor",
    mentor: "mentor",
    coach: "coach",
    district: "district_admin",
    university: "university_partner",
    recruiter: "college_recruiter",
    admissions: "college_admissions",
    employer: "employer_partner",
    "transition-youth": "scholar",
    community: "community_partner",
  };

  const relationship = map[role];
  if (!relationship) {
    throw new Error(`Role authority is not configured for ${role}.`);
  }
  return relationship;
}
