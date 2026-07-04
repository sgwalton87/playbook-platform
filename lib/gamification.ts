export * from "./gamification/index";

import { awardCoins, type CoinAction } from "./gamification/index";

export async function addReward(
  scholarId: string,
  action: CoinAction | string,
  sourceId?: string
) {
  const safeAction = ([
    "course.completed",
    "invitation.sent",
    "invitation.accepted",
    "shared_action.completed",
    "goal.completed",
    "evidence.verified",
    "message.sent",
    "milestone.completed",
  ].includes(action)
    ? action
    : "course.completed") as CoinAction;

  return awardCoins({
    scholarId,
    action: safeAction,
    sourceId,
  });
}
