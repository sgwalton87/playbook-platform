import type { PlaybookRoleOS } from "@/lib/role-os";
import type { RelationshipKind } from "./rolePermissions";

export function mapRoleToRelationship(role: PlaybookRoleOS): RelationshipKind {
  const map: Record<PlaybookRoleOS, RelationshipKind> = {
    learner: "scholar",
    family: "parent_guardian",
    educator: "educator",
    mentor: "mentor",
    district: "district_admin",
    university: "university_partner",
    employer: "employer_partner",
  };

  return map[role];
}
