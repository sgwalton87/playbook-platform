import type { ExperienceCollection, ExperienceKind, ExperienceRecord, RawExperienceInput } from "./types";

function toNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function classifyExperience(value = ""): ExperienceKind {
  const normalized = value.toLowerCase();
  if (normalized.includes("intern")) return "internship";
  if (normalized.includes("entrepreneur") || normalized.includes("founder") || normalized.includes("business")) return "entrepreneurship";
  if (normalized.includes("research")) return "research";
  if (normalized.includes("apprentice")) return "apprenticeship";
  if (normalized.includes("fellow")) return "fellowship";
  if (normalized.includes("certif") || normalized.includes("credential")) return "certification";
  if (normalized.includes("job") || normalized.includes("work") || normalized.includes("employment")) return "work";
  if (normalized.includes("lead")) return "leadership";
  if (normalized.includes("service") || normalized.includes("volunteer") || normalized.includes("community")) return "service";
  if (normalized.includes("award") || normalized.includes("honor")) return "award";
  if (normalized.includes("activity") || normalized.includes("club") || normalized.includes("extracurricular")) return "activity";
  return "other";
}

export function buildExperienceRecord(input: RawExperienceInput, index = 0): ExperienceRecord {
  const type = input.kind || input.type || input.activity_type || "Experience";
  const kind = classifyExperience(type);
  const hours = toNumber(input.total_hours ?? input.hours ?? input.volunteer_hours);
  const volunteerHours = kind === "service" ? hours : toNumber(input.volunteer_hours);

  return {
    id: input.id || `experience-${index}`,
    source: input.source || "student_activities",
    kind,
    type,
    title: input.title || input.activity_name || input.name || type,
    roleTitle: input.roleTitle || input.role_title || null,
    organization: input.organization || input.issuer || null,
    description: input.description || null,
    hours,
    volunteerHours,
    startDate: input.startDate || input.start_date || null,
    endDate: input.endDate || input.end_date || null,
    issuedAt: input.issued_at || null,
    createdAt: input.created_at || null,
    verified: Boolean(input.verified || kind === "certification"),
    skills: input.skills || [],
    reflection: input.reflection || null,
    outcome: input.outcome || input.outcomes || null,
    raw: input,
  };
}

const byKind = (records: ExperienceRecord[], kinds: ExperienceKind[]) => records.filter((record) => kinds.includes(record.kind));

export function buildExperienceCollection(inputs: RawExperienceInput[] = []): ExperienceCollection {
  const all = inputs.map(buildExperienceRecord);
  return {
    all,
    internships: byKind(all, ["internship"]),
    workExperience: byKind(all, ["work"]),
    entrepreneurship: byKind(all, ["entrepreneurship"]),
    research: byKind(all, ["research"]),
    apprenticeships: byKind(all, ["apprenticeship"]),
    fellowships: byKind(all, ["fellowship"]),
    certifications: byKind(all, ["certification"]),
    leadership: byKind(all, ["leadership"]),
    service: byKind(all, ["service"]),
    activities: byKind(all, ["activity"]),
    awards: byKind(all, ["award"]),
    other: byKind(all, ["other"]),
    volunteerHours: all.reduce((sum, record) => sum + record.volunteerHours, 0),
    verifiedTotal: all.filter((record) => record.verified).length,
  };
}
