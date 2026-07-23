import type { PlaybookRoleOS } from "@/lib/role-os";
import type { PlaybookRole } from "@/lib/roles/registry";
import type { RelationshipKind } from "./rolePermissions";

export function mapRoleToRelationship(
  role: PlaybookRoleOS | PlaybookRole,
): RelationshipKind {
  const map: Record<PlaybookRoleOS | PlaybookRole, RelationshipKind> = {
    learner: "scholar",
    scholar: "scholar",
    "scholar-athlete": "scholar",
    "transition-youth": "scholar",
    "athlete-abroad": "scholar",
    family: "parent_guardian",
    educator: "educator",
    counselor: "educator",
    coach: "educator",
    mentor: "mentor",
    district: "district_admin",
    university: "university_partner",
    "college-coach": "university_partner",
    "college-admissions": "university_partner",
    employer: "employer_partner",
    "brand-partner": "employer_partner",
    other: "mentor",
  };

  return map[role];
}
