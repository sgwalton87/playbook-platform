import type { RawCommunityActivity } from "@/lib/scholar/community";
import type { RawExperienceInput } from "./types";

export function translateActivitiesToExperiences(activities: RawCommunityActivity[] = []): RawExperienceInput[] {
  return activities.map((activity) => ({ ...activity, source: "student_activities" }));
}

export function translateCertificatesToExperiences(certificates: unknown[] = []): RawExperienceInput[] {
  return certificates.map((certificate, index) => {
    const item = (certificate || {}) as Record<string, unknown>;
    return {
      id: String(item.id || `certificate-${index}`),
      source: "certificates",
      kind: "certification",
      title: String(item.title || item.name || "Certificate"),
      issuer: typeof item.issuer === "string" ? item.issuer : null,
      issued_at: typeof item.issued_at === "string" ? item.issued_at : null,
      verified: true,
    };
  });
}
