export interface NotificationsExecution { actorId: string; approvalId: string; provenance: readonly string[] }
export function executeNotifications(input: NotificationsExecution): NotificationsExecution {
  if (!input.actorId) throw new Error("Authenticated actor required.");
  if (!input.approvalId) throw new Error("Governed approval required.");
  if (input.provenance.length === 0) throw new Error("Evidence provenance required.");
  return { ...input, provenance: [...input.provenance, input.approvalId] };
}
