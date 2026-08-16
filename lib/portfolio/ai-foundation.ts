import { Portfolio } from "./types";

type AnyRecord = Record<string, unknown>;

export interface CanonicalAcademicSummary {
  gpa: { weighted: string | null; unweighted: string | null };
  testing: { sat: string | null; act: string | null };
  goals: { dreamSchool: string | null; intendedMajor: string | null };
  transcript: { courses: string[]; credits: number | null; readinessSignals: string[] };
}

export interface CanonicalResumeObject {
  name: string;
  headline: string;
  education: string[];
  academics: CanonicalAcademicSummary;
  activities: string[];
  leadership: string[];
  athletics: string[];
  badges: string[];
  certificates: string[];
}

export interface CanonicalScholarshipObject {
  scholarId: string;
  academicSignals: string[];
  activities: string[];
  leadership: string[];
  serviceSignals: string[];
  badges: string[];
  certificates: string[];
  matchingInputs: string[];
}

export interface CanonicalRecruitingObject {
  scholarId: string;
  identity: { name: string; school: string | null; graduationYear: string | null };
  athletics: NonNullable<Portfolio["athletics"]>;
  academics: CanonicalAcademicSummary;
  activities: string[];
  recruitingInputs: string[];
}

export interface CanonicalStudentSnapshot {
  scholarId: string;
  name: string;
  location: string | null;
  grade: string | null;
  school: string | null;
  graduationYear: string | null;
  completionPercent: number | null;
  xp: number;
  coins: number;
  strengths: string[];
  nextBestInputs: string[];
}

export interface CanonicalAIProfile {
  version: "scholar-ai-foundation.v1";
  generatedAt: string;
  identity: Portfolio["identity"];
  academics: CanonicalAcademicSummary;
  collegeGoals: { dreamSchool: string | null; intendedMajor: string | null; careerGoal: string | null };
  activities: string[];
  leadership: string[];
  athletics: NonNullable<Portfolio["athletics"]>;
  transcript: CanonicalAcademicSummary["transcript"];
  badges: string[];
  certificates: string[];
  xp: number;
  coins: number;
  resume: CanonicalResumeObject;
  scholarship: CanonicalScholarshipObject;
  recruiting: CanonicalRecruitingObject;
  studentSnapshot: CanonicalStudentSnapshot;
  engineInputs: {
    collegeRecommendation: string[];
    scholarshipMatching: string[];
    recruiting: string[];
    resumeGeneration: string[];
    transcriptAnalysis: string[];
    essayCoaching: string[];
  };
}

function text(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

function label(row: AnyRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = text(row?.[key]);
    if (value) return value;
  }
  return null;
}

function labels(rows: unknown, keys: string[]): string[] {
  return Array.isArray(rows)
    ? rows.map((row) => label(row as AnyRecord, keys)).filter((item): item is string => Boolean(item))
    : [];
}

function numberValue(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function buildCanonicalAcademicSummary(portfolio: Portfolio, assembled: AnyRecord): CanonicalAcademicSummary {
  const transcriptRows = assembled.transcript || assembled.courses || assembled.transcriptRows || [];
  const courses = labels(transcriptRows, ["course_title", "course_name", "title", "name"]);
  const credits = Array.isArray(transcriptRows)
    ? transcriptRows.reduce((sum: number, row: AnyRecord) => sum + numberValue(row["credits"] ?? row["credit"]), 0)
    : 0;

  return {
    gpa: { weighted: text(portfolio.academics.weightedGpa), unweighted: text(portfolio.academics.unweightedGpa) },
    testing: { sat: text(portfolio.academics.satScore), act: text(portfolio.academics.actScore) },
    goals: { dreamSchool: text(portfolio.academics.dreamSchool), intendedMajor: text(portfolio.academics.intendedMajor) },
    transcript: {
      courses,
      credits: credits > 0 ? credits : null,
      readinessSignals: unique([
        portfolio.academics.weightedGpa ? "weighted_gpa_available" : "weighted_gpa_missing",
        portfolio.academics.unweightedGpa ? "unweighted_gpa_available" : "unweighted_gpa_missing",
        courses.length > 0 ? "transcript_courses_available" : "transcript_courses_missing",
      ]),
    },
  };
}

export function buildCanonicalAIProfile(assembled: AnyRecord): CanonicalAIProfile {
  const portfolio = assembled.portfolio as Portfolio;
  const academics = buildCanonicalAcademicSummary(portfolio, assembled);
  const activities = labels(assembled.activities, ["title", "activity_name", "name", "activity_type"]);
  const leadership = labels(assembled.activities, ["role_title", "leadership_role", "position"]);
  const badges = labels(assembled.badgeRows || assembled.badges, ["name", "badge_name", "id"]);
  const certificates = labels(assembled.certificates, ["certificate_name", "title", "name", "course_slug"]);
  const athletics = portfolio.athletics || {};
  const name = portfolio.identity.fullName || [portfolio.identity.firstName, portfolio.identity.lastName].filter(Boolean).join(" ") || "Scholar";
  const education = unique([portfolio.identity.school, portfolio.identity.graduationYear ? `Class of ${portfolio.identity.graduationYear}` : null].filter((item): item is string => Boolean(item)));
  const academicSignals = unique([academics.gpa.weighted && `Weighted GPA: ${academics.gpa.weighted}`, academics.goals.intendedMajor && `Major: ${academics.goals.intendedMajor}`].filter((item): item is string => Boolean(item)));
  const athleticSignals = unique([athletics.sport, athletics.position, athletics.recruitingStatus].filter((item): item is string => Boolean(item)));
  const xp = numberValue(assembled.xp ?? (assembled.rawProfile as AnyRecord | undefined)?.xp);
  const coins = numberValue(assembled.coins ?? (assembled.rawProfile as AnyRecord | undefined)?.coins);
  const matchingInputs = unique([...academicSignals, ...activities, ...leadership, ...certificates, ...badges]);
  const completionPercentValue = ((assembled.intelligence as AnyRecord | undefined)?.completion as AnyRecord | undefined)?.percent;
  const completionPercent = typeof completionPercentValue === "number" ? completionPercentValue : null;

  const resume: CanonicalResumeObject = { name, headline: portfolio.identity.bio || portfolio.career.idealProfession || "Emerging scholar", education, academics, activities, leadership, athletics: athleticSignals, badges, certificates };
  const scholarship: CanonicalScholarshipObject = { scholarId: portfolio.identity.id, academicSignals, activities, leadership, serviceSignals: activities.filter((activity) => /service|volunteer|community/i.test(activity)), badges, certificates, matchingInputs };
  const recruiting: CanonicalRecruitingObject = { scholarId: portfolio.identity.id, identity: { name, school: portfolio.identity.school || null, graduationYear: portfolio.identity.graduationYear || null }, athletics, academics, activities, recruitingInputs: unique([...athleticSignals, ...academicSignals, ...activities]) };
  const studentSnapshot: CanonicalStudentSnapshot = { scholarId: portfolio.identity.id, name, location: [portfolio.identity.city, portfolio.identity.state].filter(Boolean).join(", ") || null, grade: portfolio.identity.grade || null, school: portfolio.identity.school || null, graduationYear: portfolio.identity.graduationYear || null, completionPercent, xp, coins, strengths: unique([...leadership, ...badges, ...certificates]).slice(0, 8), nextBestInputs: unique([academics.transcript.courses.length === 0 ? "Add transcript courses" : "Review transcript readiness", activities.length === 0 ? "Add activities" : "Update activity impact", certificates.length === 0 ? "Add certificates" : "Share certificates"]) };

  return {
    version: "scholar-ai-foundation.v1",
    generatedAt: new Date(0).toISOString(),
    identity: portfolio.identity,
    academics,
    collegeGoals: { dreamSchool: academics.goals.dreamSchool, intendedMajor: academics.goals.intendedMajor, careerGoal: portfolio.career.idealProfession || null },
    activities,
    leadership,
    athletics,
    transcript: academics.transcript,
    badges,
    certificates,
    xp,
    coins,
    resume,
    scholarship,
    recruiting,
    studentSnapshot,
    engineInputs: { collegeRecommendation: unique([...academicSignals, portfolio.career.idealProfession || "", portfolio.identity.state || ""]), scholarshipMatching: matchingInputs, recruiting: recruiting.recruitingInputs, resumeGeneration: unique([...education, ...activities, ...leadership, ...certificates, ...badges]), transcriptAnalysis: academics.transcript.readinessSignals, essayCoaching: unique([portfolio.identity.bio || "", portfolio.career.idealProfession || "", ...activities, ...leadership]).filter(Boolean) },
  };
}
