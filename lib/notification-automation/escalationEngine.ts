export function buildEscalation(input: {
  blocker: any;
  ageDays: number;
  assignedRole?: string;
}) {
  if (input.ageDays >= 7) {
    return {
      level: "urgent",
      title: `Escalate ${input.blocker.title}`,
      action: "Notify scholar, assigned supporter, and mentor.",
      reason: "This blocker has been unresolved for 7+ days.",
    };
  }

  if (input.ageDays >= 3) {
    return {
      level: "high",
      title: `Follow up on ${input.blocker.title}`,
      action: `Notify ${input.assignedRole || input.blocker.role || "support network"}.`,
      reason: "This blocker has been unresolved for 3+ days.",
    };
  }

  return {
    level: "watch",
    title: `Watch ${input.blocker.title}`,
    action: "Keep visible in Compass Network Intelligence.",
    reason: "This blocker is still within the normal response window.",
  };
}
