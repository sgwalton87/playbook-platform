export type RewardEventType =
  | "course.completed"
  | "module.completed"
  | "invitation.sent"
  | "invitation.accepted"
  | "shared_action.completed"
  | "goal.completed"
  | "evidence.verified"
  | "message.sent"
  | "milestone.completed"
  | "portfolio.shared"
  | "recommendation.approved"
  | "application.ready"
  | "athlete.eligibility_progress"
  | "store.redemption";

export function getRewardValue(eventType: RewardEventType) {
  const values: Record<RewardEventType, { coins: number; xp: number; reason: string }> = {
    "course.completed": { coins: 100, xp: 250, reason: "Completed a course" },
    "module.completed": { coins: 20, xp: 50, reason: "Completed a module" },
    "invitation.sent": { coins: 25, xp: 25, reason: "Invited a supporter" },
    "invitation.accepted": { coins: 50, xp: 75, reason: "Activated support network" },
    "shared_action.completed": { coins: 40, xp: 60, reason: "Completed a shared action" },
    "goal.completed": { coins: 150, xp: 200, reason: "Completed a goal" },
    "evidence.verified": { coins: 75, xp: 100, reason: "Verified evidence" },
    "message.sent": { coins: 5, xp: 5, reason: "Sent a support message" },
    "milestone.completed": { coins: 125, xp: 175, reason: "Completed a milestone" },
    "portfolio.shared": { coins: 80, xp: 100, reason: "Shared a portfolio packet" },
    "recommendation.approved": { coins: 90, xp: 120, reason: "Approved a recommendation letter" },
    "application.ready": { coins: 125, xp: 180, reason: "Application workspace became ready" },
    "athlete.eligibility_progress": { coins: 100, xp: 150, reason: "Improved athlete eligibility readiness" },
    "store.redemption": { coins: 0, xp: 25, reason: "Redeemed store reward" },
  };

  return values[eventType];
}

export function buildRewardEvent(input: {
  scholarId: string;
  eventType: RewardEventType;
  sourceId?: string;
  payload?: Record<string, unknown>;
}) {
  return {
    scholar_id: input.scholarId,
    event_type: input.eventType,
    source_id: input.sourceId || null,
    payload: input.payload || {},
    processed: false,
  };
}

export function buildCoinLedgerEntry(input: {
  scholarId: string;
  eventType: RewardEventType;
  sourceId?: string;
}) {
  const value = getRewardValue(input.eventType);

  return {
    scholar_id: input.scholarId,
    event_type: input.eventType,
    source_id: input.sourceId || null,
    coins: value.coins,
    xp: value.xp,
    reason: value.reason,
  };
}

export function calculateRewardBalance(entries: Array<{ coins: number; xp: number }>) {
  return entries.reduce(
    (totals, entry) => ({
      coins: totals.coins + entry.coins,
      xp: totals.xp + entry.xp,
    }),
    { coins: 0, xp: 0 }
  );
}
