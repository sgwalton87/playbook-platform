export async function emitPlaybookEvent(input: {
  type: string;
  scholarId: string;
  actorId?: string;
  actorRole?: string;
  payload?: Record<string, unknown>;
}) {
  try {
    await fetch("/api/events/emit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
  } catch {
    // Event emission should not block user workflow.
  }
}
