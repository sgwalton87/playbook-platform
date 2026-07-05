export type SocialEventType =
  | "post.created"
  | "photo.posted"
  | "comment.created"
  | "reaction.created"
  | "achievement.shared"
  | "event.rsvp"
  | "mentor.connected";

export function buildSocialRewardEvent(input: {
  scholarId: string;
  eventType: SocialEventType;
  sourceId?: string;
}) {
  const rewardMap: Record<SocialEventType, { coins: number; xp: number; reason: string }> = {
    "post.created": { coins: 5, xp: 5, reason: "Shared a community update" },
    "photo.posted": { coins: 10, xp: 10, reason: "Shared a photo memory" },
    "comment.created": { coins: 2, xp: 2, reason: "Participated in community discussion" },
    "reaction.created": { coins: 1, xp: 1, reason: "Encouraged a peer" },
    "achievement.shared": { coins: 25, xp: 30, reason: "Shared an achievement" },
    "event.rsvp": { coins: 15, xp: 20, reason: "RSVP'd to a community event" },
    "mentor.connected": { coins: 30, xp: 40, reason: "Connected with a mentor" },
  };

  return {
    scholar_id: input.scholarId,
    event_type: input.eventType,
    source_id: input.sourceId || null,
    ...rewardMap[input.eventType],
  };
}

export function buildSocialNotification(input: {
  userId: string;
  title: string;
  body: string;
  href: string;
}) {
  return {
    user_id: input.userId,
    type: "community",
    title: input.title,
    body: input.body,
    href: input.href,
    read: false,
    priority: "normal",
  };
}
