export type CoinAction =
  | "course.completed"
  | "invitation.sent"
  | "invitation.accepted"
  | "shared_action.completed"
  | "goal.completed"
  | "evidence.verified"
  | "message.sent"
  | "milestone.completed";

export function getCoinValue(action: CoinAction) {
  const values: Record<CoinAction, number> = {
    "course.completed": 100,
    "invitation.sent": 25,
    "invitation.accepted": 50,
    "shared_action.completed": 40,
    "goal.completed": 150,
    "evidence.verified": 75,
    "message.sent": 5,
    "milestone.completed": 125,
  };

  return values[action];
}

export function awardCoins(input: {
  scholarId: string;
  action: CoinAction;
  sourceId?: string;
}) {
  return {
    scholarId: input.scholarId,
    action: input.action,
    coins: getCoinValue(input.action),
    sourceId: input.sourceId || null,
    createdAt: new Date().toISOString(),
  };
}

export function getDemoCoinLedger() {
  return [
    awardCoins({ scholarId: "scholar-maya", action: "course.completed" }),
    awardCoins({ scholarId: "scholar-maya", action: "evidence.verified" }),
    awardCoins({ scholarId: "scholar-maya", action: "shared_action.completed" }),
  ];
}

export function getCoinBalance(entries = getDemoCoinLedger()) {
  return entries.reduce((sum, entry) => sum + entry.coins, 0);
}
