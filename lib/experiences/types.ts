export type ExperienceKind =
  | "internship"
  | "work"
  | "entrepreneurship"
  | "research"
  | "apprenticeship"
  | "fellowship"
  | "certification"
  | "leadership"
  | "service"
  | "activity"
  | "award"
  | "other";

export type ExperienceSource =
  | "student_activities"
  | "certificates"
  | "profile"
  | "scholar_record"
  | "derived";

export interface RawExperienceInput {
  id?: string;
  source?: ExperienceSource;
  kind?: string | null;
  type?: string | null;
  activity_type?: string | null;
  activity_name?: string | null;
  title?: string | null;
  name?: string | null;
  role_title?: string | null;
  roleTitle?: string | null;
  organization?: string | null;
  issuer?: string | null;
  description?: string | null;
  reflection?: string | null;
  outcome?: string | null;
  outcomes?: string | null;
  total_hours?: number | string | null;
  hours?: number | string | null;
  volunteer_hours?: number | string | null;
  start_date?: string | null;
  startDate?: string | null;
  end_date?: string | null;
  endDate?: string | null;
  issued_at?: string | null;
  created_at?: string | null;
  verified?: boolean | null;
  skills?: string[] | null;
}

export interface ExperienceRecord {
  id: string;
  source: ExperienceSource;
  kind: ExperienceKind;
  type: string;
  title: string;
  roleTitle: string | null;
  organization: string | null;
  description: string | null;
  hours: number;
  volunteerHours: number;
  startDate: string | null;
  endDate: string | null;
  issuedAt: string | null;
  createdAt: string | null;
  verified: boolean;
  skills: string[];
  reflection: string | null;
  outcome: string | null;
  raw: RawExperienceInput;
}

export interface ExperienceCollection {
  all: ExperienceRecord[];
  internships: ExperienceRecord[];
  workExperience: ExperienceRecord[];
  entrepreneurship: ExperienceRecord[];
  research: ExperienceRecord[];
  apprenticeships: ExperienceRecord[];
  fellowships: ExperienceRecord[];
  certifications: ExperienceRecord[];
  leadership: ExperienceRecord[];
  service: ExperienceRecord[];
  activities: ExperienceRecord[];
  awards: ExperienceRecord[];
  other: ExperienceRecord[];
  volunteerHours: number;
  verifiedTotal: number;
}
