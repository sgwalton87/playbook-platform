export const LAUNCH_ANALYTICS_EVENTS = {
  "auth.signed_in": { family: "identity", properties: ["role", "method"] },
  "onboarding.completed": { family: "activation", properties: ["role", "destination"] },
  "evidence.added": { family: "trust", properties: ["sourceType", "visibility"] },
  "evidence.verification_requested": { family: "trust", properties: ["reviewerRole"] },
  "portfolio.shared": { family: "portability", properties: ["sectionCount", "expiresInDays"] },
  "opportunity.opened": { family: "outcome", properties: ["opportunityType", "sourceName"] },
  "support.action_completed": { family: "support", properties: ["actionType", "supporterRole"] },
} as const;
export type LaunchAnalyticsEvent = keyof typeof LAUNCH_ANALYTICS_EVENTS;
export function isLaunchAnalyticsEvent(value: string): value is LaunchAnalyticsEvent { return value in LAUNCH_ANALYTICS_EVENTS; }
