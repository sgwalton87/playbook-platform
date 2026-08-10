export function createSupportMessage(input: {
  scholarId: string;
  senderRole: string;
  body: string;
}) {
  return {
    scholar_id: input.scholarId,
    sender_role: input.senderRole,
    body: input.body,
  };
}

export function createSharedAction(input: {
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

export function getDemoSupportThread() {
  return [
    createSupportMessage({
      scholarId: "scholar-record",
      senderRole: "family",
      body: "I can help gather the documents tonight.",
    }),
    createSupportMessage({
      scholarId: "scholar-record",
      senderRole: "mentor",
      body: "I can do a mock interview this weekend.",
    }),
  ];
}

export function getDemoSharedActions() {
  return [
    createSharedAction({
      scholarId: "scholar-record",
      assignedRole: "family",
      title: "Upload support documents",
      detail: "Consent, transportation, and schedule info.",
    }),
    createSharedAction({
      scholarId: "scholar-record",
      assignedRole: "mentor",
      title: "Schedule mock interview",
      detail: "Prepare for health careers internship.",
    }),
  ];
}
