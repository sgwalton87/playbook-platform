export type RelationshipType =
  | "mother"
  | "father"
  | "guardian"
  | "grandparent"
  | "teacher"
  | "counselor"
  | "coach"
  | "mentor"
  | "employer"
  | "university_recruiter"
  | "district_admin";

export function createRelationship(input: {
  scholarId: string;
  personName: string;
  relationship: RelationshipType;
}) {
  return {
    id: `${input.scholarId}-${input.relationship}-${input.personName.toLowerCase().replaceAll(" ", "-")}`,
    ...input,
    permissions: inferPermissions(input.relationship),
  };
}

function inferPermissions(type: RelationshipType) {
  if (["mother", "father", "guardian", "grandparent"].includes(type)) {
    return ["view_progress", "support_tasks", "receive_notifications"];
  }

  if (["teacher", "counselor", "coach", "mentor"].includes(type)) {
    return ["view_progress", "verify_evidence", "recommend_actions"];
  }

  return ["view_verified_record", "create_opportunities"];
}
