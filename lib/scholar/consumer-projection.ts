import type { ScholarRecord } from "@/lib/scholar/types";

/**
 * SJ-00: private, owner-scoped consumer projection.
 * IMPORTANT: caller must authenticate via server session and load record through RLS.
 * This mapper is a second defense against accidental cross-owner use, NOT an auth API,
 * share link, permission grant or replacement Scholar Record data store.
 */
export type ScholarConsumerEntry = {
  id: string;
  category: "service" | "leadership" | "award" | "experience" | "credential";
  title: string;
  organization: string | null;
  role: string | null;
  startDate: string | null;
  endDate: string | null;
  hours: number | null;
  verification: "verified" | "unverified";
  source: "scholar-community" | "scholar-certificate";
};

export type ScholarConsumerProjection = {
  schemaVersion: "sj-00/v1";
  scholarId: string;
  name: string;
  school: string | null;
  entries: ScholarConsumerEntry[];
  disclosure: "Private owner view; not approved for external sharing";
};

export function buildOwnerScholarConsumerProjection(
  record: ScholarRecord,
  authenticatedUserId: string,
): ScholarConsumerProjection {
  if (!authenticatedUserId || !record.id || record.id !== authenticatedUserId) {
    throw new Error("Scholar Record owner authorization required");
  }

  const entries: ScholarConsumerEntry[] = [];
  const used = new Set<string>();
  for (const item of record.community.experiences) {
    const category =
      item.kind === "service" || item.kind === "volunteer" ? "service" :
      item.kind === "leadership" ? "leadership" :
      item.kind === "award" || item.kind === "honor" ? "award" :
      item.kind === "work" || item.kind === "internship" || item.kind === "research" ? "experience" :
      item.kind === "certification" ? "credential" : null;
    if (!category || !item.name) continue;
    const id = `community:${item.id}`;
    if (used.has(id)) continue;
    used.add(id);
    entries.push({
      id, category, title: item.name, organization: item.organization,
      role: item.roleTitle, startDate: item.startDate, endDate: item.endDate,
      hours: category === "service" && Number.isFinite(item.volunteerHours) && item.volunteerHours >= 0
        ? item.volunteerHours : null,
      verification: item.verified ? "verified" : "unverified",
      source: "scholar-community",
    });
  }
  // Certificates are not claimed to be externally verified merely by being present.
  for (let index = 0; index < record.achievements.certificates.length; index++) {
    const certificate = record.achievements.certificates[index] as Record<string, unknown>;
    const title = certificate?.title ?? certificate?.name;
    if (typeof title !== "string" || !title.trim()) continue;
    const id = `certificate:${String(certificate.id ?? index)}`;
    if (used.has(id)) continue;
    used.add(id);
    entries.push({
      id, category: "credential", title: title.trim(), organization: null, role: null,
      startDate: null, endDate: null, hours: null, verification: "unverified",
      source: "scholar-certificate",
    });
  }
  return {
    schemaVersion: "sj-00/v1",
    scholarId: record.id,
    name: record.identity.fullName,
    school: record.academics.school ?? null,
    entries,
    disclosure: "Private owner view; not approved for external sharing",
  };
}
