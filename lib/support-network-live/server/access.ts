export function canAccessScholarNetwork(input: {
  relationships: Array<{
    scholar_id?: string | null;
    supporter_id?: string | null;
    supporter_email?: string | null;
  }>;
  scholarId: string;
  userId?: string | null;
  userEmail?: string | null;
}) {
  if (input.userId === input.scholarId) return true;

  return input.relationships.some((rel) => {
    const sameScholar = rel.scholar_id === input.scholarId;
    const sameUser = input.userId && rel.supporter_id === input.userId;
    const sameEmail =
      input.userEmail &&
      rel.supporter_email?.toLowerCase() === input.userEmail.toLowerCase();

    return sameScholar && (sameUser || sameEmail);
  });
}

export function buildSupportMessageRecord(input: {
  scholarId: string;
  senderId?: string | null;
  senderRole: string;
  body: string;
}) {
  return {
    scholar_id: input.scholarId,
    sender_id: input.senderId || null,
    sender_role: input.senderRole,
    body: input.body,
  };
}

export function buildSharedActionRecord(input: {
  scholarId: string;
  assignedRole: string;
  title: string;
  detail?: string;
  dueDate?: string;
}) {
  return {
    scholar_id: input.scholarId,
    assigned_role: input.assignedRole,
    title: input.title,
    detail: input.detail || null,
    due_date: input.dueDate || null,
    status: "open",
  };
}

export function suggestActionUpdateFromMessage(body: string) {
  const text = body.toLowerCase();

  if (text.includes("uploaded") || text.includes("done") || text.includes("completed")) {
    return {
      suggestedStatus: "complete",
      confidence: "medium",
      reason: "Message appears to describe a completed task.",
    };
  }

  if (text.includes("working") || text.includes("started")) {
    return {
      suggestedStatus: "in_progress",
      confidence: "medium",
      reason: "Message appears to describe work in progress.",
    };
  }

  return {
    suggestedStatus: null,
    confidence: "low",
    reason: "No clear action update detected.",
  };
}
