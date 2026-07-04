export * from "./gamification/index";

import { awardCoins, type CoinAction } from "./gamification/index";

export async function addReward(
  scholarId: string,
  actionOrReward: CoinAction | string | { coins?: number; xp?: number },
  sourceId?: string
) {
  if (typeof actionOrReward === "object") {
    return {
      scholarId,
      action: "legacy.reward",
      coins: actionOrReward.coins || 0,
      xp: actionOrReward.xp || 0,
      sourceId: sourceId || null,
      createdAt: new Date().toISOString(),
    };
  }

  const safeAction = ([
    "course.completed",
    "invitation.sent",
    "invitation.accepted",
    "shared_action.completed",
    "goal.completed",
    "evidence.verified",
    "message.sent",
    "milestone.completed",
  ].includes(actionOrReward)
    ? actionOrReward
    : "course.completed") as CoinAction;

  return awardCoins({
    scholarId,
    action: safeAction,
    sourceId,
  });
}
