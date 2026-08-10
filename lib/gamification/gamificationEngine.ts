import {
  buildCoinLedgerEntry,
  calculateRewardBalance,
  getRewardValue,
  type RewardEventType,
} from "@/lib/reward-events";

export type CoinAction = Extract<
  RewardEventType,
  | "course.completed"
  | "invitation.sent"
  | "invitation.accepted"
  | "shared_action.completed"
  | "goal.completed"
  | "evidence.verified"
  | "message.sent"
  | "milestone.completed"
>;

export function getCoinValue(action: CoinAction) {
  return getRewardValue(action).coins;
}

export function awardCoins(input: {
  scholarId: string;
  action: CoinAction;
  sourceId?: string;
}) {
  const entry = buildCoinLedgerEntry({
    scholarId: input.scholarId,
    eventType: input.action,
    sourceId: input.sourceId,
  });

  return {
    scholarId: entry.scholar_id,
    action: entry.event_type,
    coins: entry.coins,
    xp: entry.xp,
    reason: entry.reason,
    sourceId: entry.source_id,
    createdAt: new Date().toISOString(),
  };
}

export function getDemoCoinLedger() {
  return [
    awardCoins({ scholarId: "scholar-record", action: "course.completed" }),
    awardCoins({ scholarId: "scholar-record", action: "evidence.verified" }),
    awardCoins({ scholarId: "scholar-record", action: "shared_action.completed" }),
  ];
}

export function getCoinBalance(entries = getDemoCoinLedger()) {
  return calculateRewardBalance(entries).coins;
}

export function getXPBalance(entries = getDemoCoinLedger()) {
  return calculateRewardBalance(entries).xp;
}
