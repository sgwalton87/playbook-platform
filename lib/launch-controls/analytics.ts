import { isLaunchAnalyticsEvent, LAUNCH_ANALYTICS_EVENTS, type LaunchAnalyticsEvent } from "./analyticsTaxonomy";

type AnalyticsScalar = string | number | boolean | null;
export type AnalyticsPayload = { event: LaunchAnalyticsEvent; properties: Record<string, AnalyticsScalar> };

export function sanitizeLaunchAnalytics(input: { event?: unknown; properties?: unknown }): AnalyticsPayload | null {
  if (typeof input.event !== "string" || !isLaunchAnalyticsEvent(input.event)) return null;
  const source = input.properties && typeof input.properties === "object" && !Array.isArray(input.properties) ? input.properties as Record<string, unknown> : {};
  const properties: Record<string, AnalyticsScalar> = {};
  for (const key of LAUNCH_ANALYTICS_EVENTS[input.event].properties) {
    const value = source[key];
    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") properties[key] = typeof value === "string" ? value.slice(0, 160) : value;
  }
  return { event: input.event, properties };
}
