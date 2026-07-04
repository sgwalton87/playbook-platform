export function resolveRecipientsFromRelationships(input: {
  scholarId: string;
  relationships: any[];
  includeScholar?: boolean;
}) {
  const recipients = input.relationships
    .filter((rel) => rel.status === "active")
    .map((rel) => ({
      userId: rel.supporter_id || rel.supporter_email,
      email: rel.supporter_email,
      role: rel.relationship,
      scholarId: rel.scholar_id,
      permissions: rel.permissions || [],
    }))
    .filter((rel) => rel.scholarId === input.scholarId);

  if (input.includeScholar !== false) {
    recipients.unshift({
      userId: input.scholarId,
      email: null,
      role: "scholar",
      scholarId: input.scholarId,
      permissions: ["view_progress", "support_tasks"],
    });
  }

  return recipients;
}
