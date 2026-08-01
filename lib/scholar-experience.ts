import { getDefaultNotificationPreferences } from "./notification-automation/preferences";

export interface ScholarEvidenceSummaryItem {
  title: string;
  status: "ready" | "pending";
}

export interface ScholarEvidenceSummary {
  totalItems: number;
  verifiedItems: number;
  latest: ScholarEvidenceSummaryItem[];
}

export interface ScholarNotificationPreferenceSummaryItem {
  key: string;
  label: string;
  mode: string;
}

export interface EvidenceTraceabilityItem {
  title: string;
  status: "ready" | "pending";
  source: string;
}

export interface EvidenceTraceabilityFeed {
  totalItems: number;
  readyItems: number;
  latest: EvidenceTraceabilityItem[];
}

export function buildScholarEvidenceSummary(input: {
  achievements?: Array<{ title?: string; category?: string }>;
  evidence?: Array<{ title?: string }>;
  timelineEvents?: Array<{ title?: string; verified?: boolean }>;
}): ScholarEvidenceSummary {
  const achievementItems = (input.achievements || []).map((item) => ({
    title: item.title || "Achievement",
    status: "pending" as const,
  }));
  const evidenceItems = (input.evidence || []).map((item) => ({
    title: item.title || "Evidence item",
    status: "ready" as const,
  }));
  const timelineItems = (input.timelineEvents || []).map((item) => ({
    title: item.title || "Timeline update",
    status: item.verified ? ("ready" as const) : ("pending" as const),
  }));

  const latest = [...achievementItems, ...evidenceItems, ...timelineItems].slice(0, 4);
  const verifiedItems = timelineItems.filter((item) => item.status === "ready").length;

  return {
    totalItems: latest.length,
    verifiedItems,
    latest,
  };
}

export function buildEvidenceTraceabilityFeed(input: {
  items?: Array<{ title?: string; status?: "ready" | "pending"; source?: string }>;
}): EvidenceTraceabilityFeed {
  const latest = (input.items || []).map((item) => ({
    title: item.title || "Evidence item",
    status: item.status || "pending",
    source: item.source || "system",
  }));

  return {
    totalItems: latest.length,
    readyItems: latest.filter((item) => item.status === "ready").length,
    latest: latest.slice(0, 4),
  };
}

export function buildNotificationPreferenceSummary(
  overrides: Partial<Record<string, string>> = {}
): ScholarNotificationPreferenceSummaryItem[] {
  const defaults = getDefaultNotificationPreferences();
  const merged = { ...defaults, ...overrides };

  return Object.entries(merged).map(([key, mode]) => ({
    key,
    label: key.replace(/_/g, " "),
    mode,
  }));
}
