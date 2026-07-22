export type CommunityExperienceKind =
  | "activity"
  | "club"
  | "leadership"
  | "service"
  | "volunteer"
  | "work"
  | "internship"
  | "research"
  | "certification"
  | "honor"
  | "award"
  | "organization"
  | "extracurricular"
  | "language"
  | "skill"
  | "hobby"
  | "interest"
  | "other";

export interface RawCommunityActivity {
  id?: string;
  student_id?: string;
  activity_type?: string | null;
  activity_name?: string | null;
  title?: string | null;
  name?: string | null;
  role_title?: string | null;
  organization?: string | null;
  total_hours?: number | string | null;
  hours?: number | string | null;
  volunteer_hours?: number | string | null;
  description?: string | null;
  reflection?: string | null;
  reflection_text?: string | null;
  outcome?: string | null;
  outcomes?: string | null;
  verified?: boolean | null;
  created_at?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface CommunityExperience {
  id: string;
  source: "student_activities" | "profile" | "derived";
  kind: CommunityExperienceKind;
  type: string;
  name: string;
  roleTitle: string | null;
  organization: string | null;
  description: string | null;
  hours: number;
  volunteerHours: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string | null;
  verified: boolean;
  reflection: string | null;
  outcome: string | null;
  raw: RawCommunityActivity;
}

export interface ScholarCommunityRecord {
  experiences: CommunityExperience[];
  activities: CommunityExperience[];
  clubs: CommunityExperience[];
  leadershipPositions: CommunityExperience[];
  communityService: CommunityExperience[];
  volunteerWork: CommunityExperience[];
  workExperience: CommunityExperience[];
  internships: CommunityExperience[];
  research: CommunityExperience[];
  certifications: CommunityExperience[];
  honors: CommunityExperience[];
  awards: CommunityExperience[];
  organizations: CommunityExperience[];
  extracurricularActivities: CommunityExperience[];
  languages: CommunityExperience[];
  skills: CommunityExperience[];
  hobbies: CommunityExperience[];
  interests: CommunityExperience[];
  volunteerHours: number;
}

function toNumber(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function classifyCommunityExperience(type = ""): CommunityExperienceKind {
  const normalized = type.toLowerCase();
  if (normalized.includes("club")) return "club";
  if (normalized.includes("lead")) return "leadership";
  if (normalized.includes("service") || normalized.includes("faith") || normalized.includes("community")) return "service";
  if (normalized.includes("volunteer")) return "volunteer";
  if (normalized.includes("job") || normalized.includes("work")) return "work";
  if (normalized.includes("intern")) return "internship";
  if (normalized.includes("research")) return "research";
  if (normalized.includes("certif")) return "certification";
  if (normalized.includes("honor")) return "honor";
  if (normalized.includes("award") || normalized.includes("recognition")) return "award";
  if (normalized.includes("organization")) return "organization";
  if (normalized.includes("extracurricular") || normalized.includes("arts") || normalized.includes("family")) return "extracurricular";
  if (normalized.includes("language")) return "language";
  if (normalized.includes("skill")) return "skill";
  if (normalized.includes("hobb")) return "hobby";
  if (normalized.includes("interest")) return "interest";
  if (normalized.includes("activity")) return "activity";
  return "other";
}

export function normalizeCommunityActivities(activities: RawCommunityActivity[] = []): CommunityExperience[] {
  return activities.map((activity, index) => {
    const type = activity.activity_type || "Activity";
    const kind = classifyCommunityExperience(type);
    const hours = toNumber(activity.total_hours ?? activity.hours ?? activity.volunteer_hours);
    const volunteerHours = kind === "volunteer" || kind === "service" ? hours : toNumber(activity.volunteer_hours);

    return {
      id: activity.id || `community-${index}`,
      source: "student_activities",
      kind,
      type,
      name: activity.activity_name || activity.title || activity.name || type,
      roleTitle: activity.role_title || null,
      organization: activity.organization || null,
      description: activity.description || null,
      hours,
      volunteerHours,
      startDate: activity.start_date || null,
      endDate: activity.end_date || null,
      createdAt: activity.created_at || null,
      verified: Boolean(activity.verified),
      reflection: activity.reflection || activity.reflection_text || null,
      outcome: activity.outcome || activity.outcomes || null,
      raw: activity,
    };
  });
}

const byKind = (experiences: CommunityExperience[], kinds: CommunityExperienceKind[]) =>
  experiences.filter((experience) => kinds.includes(experience.kind));

export function buildCommunityRecord(activities: RawCommunityActivity[] = []): ScholarCommunityRecord {
  const experiences = normalizeCommunityActivities(activities);
  const volunteerHours = experiences.reduce(
    (sum, experience) => sum + (experience.volunteerHours || experience.hours),
    0
  );

  return {
    experiences,
    activities: experiences,
    clubs: byKind(experiences, ["club"]),
    leadershipPositions: byKind(experiences, ["leadership"]),
    communityService: byKind(experiences, ["service"]),
    volunteerWork: byKind(experiences, ["volunteer", "service"]),
    workExperience: byKind(experiences, ["work"]),
    internships: byKind(experiences, ["internship"]),
    research: byKind(experiences, ["research"]),
    certifications: byKind(experiences, ["certification"]),
    honors: byKind(experiences, ["honor"]),
    awards: byKind(experiences, ["award"]),
    organizations: byKind(experiences, ["organization", "club", "service"]),
    extracurricularActivities: byKind(experiences, ["extracurricular", "activity", "club", "leadership"]),
    languages: byKind(experiences, ["language"]),
    skills: byKind(experiences, ["skill"]),
    hobbies: byKind(experiences, ["hobby"]),
    interests: byKind(experiences, ["interest"]),
    volunteerHours,
  };
}
