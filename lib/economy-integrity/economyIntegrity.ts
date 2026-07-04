import type { RewardEventType } from "@/lib/reward-events";

export function buildRewardIdempotencyKey(input: {
  scholarId: string;
  eventType: RewardEventType | string;
  sourceId?: string | null;
}) {
  return `${input.scholarId}:${input.eventType}:${input.sourceId || "none"}`;
}

export function shouldRewardMessage(input: {
  messageCountToday: number;
  hasActionContext?: boolean;
}) {
  return input.hasActionContext || input.messageCountToday <= 3;
}

export function buildRewardPolicyDecision(input: {
  scholarId: string;
  eventType: RewardEventType | string;
  sourceId?: string | null;
  alreadyProcessedKeys?: string[];
}) {
  const key = buildRewardIdempotencyKey(input);
  const alreadyProcessed = (input.alreadyProcessedKeys || []).includes(key);

  return {
    key,
    allowed: !alreadyProcessed,
    reason: alreadyProcessed
      ? "Reward already processed for this action."
      : "Reward eligible.",
  };
}

export function buildLedgerReversal(input: {
  originalLedgerId: string;
  scholarId: string;
  coins: number;
  xp: number;
  reason: string;
}) {
  return {
    scholar_id: input.scholarId,
    event_type: "ledger.reversal",
    source_id: input.originalLedgerId,
    coins: -Math.abs(input.coins),
    xp: -Math.abs(input.xp),
    reason: input.reason,
  };
}
