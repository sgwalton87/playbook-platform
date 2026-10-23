import type { ScholarConsumerEntry, ScholarConsumerProjection } from "@/lib/scholar/consumer-projection";

export type ScholarResumeSection = "service" | "leadership" | "awards" | "experience" | "credentials";

export type PrivateScholarResumeDraft = {
  schemaVersion: "sj-resume/v1";
  scholarId: string;
  name: string;
  school: string | null;
  sections: Record<ScholarResumeSection, ScholarConsumerEntry[]>;
  sharingStatus: "private";
};

/**
 * Builds a local/private resume preview from an already owner-authorized projection.
 * This MUST NOT be passed to a public endpoint; publication requires separate
 * audience, guardian, evidence and scope authorization in SJ-03.
 */
export function buildPrivateScholarResumeDraft(
  projection: ScholarConsumerProjection,
  selectedEntryIds: readonly string[],
): PrivateScholarResumeDraft {
  if (projection.disclosure !== "Private owner view; not approved for external sharing" ||
      !projection.scholarId) {
    throw new Error("Owner-authorized Scholar projection required");
  }
  const allowed = new Set(selectedEntryIds);
  const sections: PrivateScholarResumeDraft["sections"] = {
    service: [], leadership: [], awards: [], experience: [], credentials: [],
  };
  const map: Record<ScholarConsumerEntry["category"], ScholarResumeSection> = {
    service: "service", leadership: "leadership", award: "awards",
    experience: "experience", credential: "credentials",
  };
  for (const entry of projection.entries) {
    if (!allowed.has(entry.id)) continue;
    sections[map[entry.category]].push({ ...entry });
  }
  return {
    schemaVersion: "sj-resume/v1", scholarId: projection.scholarId,
    name: projection.name, school: projection.school, sections,
    sharingStatus: "private",
  };
}
