import { AG_REQUIREMENTS, AG_SUBJECT_NAMES } from "@/lib/agCourses";
import type { ScholarRecord, ScholarRecordInput, ProfileAcademicForm } from "./types";
import { buildCommunityRecord } from "./community";

const SUBJECTS = ["A", "B", "C", "D", "E", "F", "G"];

function value<T>(...items: T[]): T | null {
  return items.find((item) => item !== undefined && item !== null && item !== "") ?? null;
}

function normalizeAgProgress(rows: LegacyValue[] = []) {
  const latestBySubject = new Map<string, LegacyValue>();
  for (const row of rows) {
    if (row?.subject && !latestBySubject.has(row.subject)) latestBySubject.set(row.subject, row);
  }
  return SUBJECTS.map((subject) => {
    const row = latestBySubject.get(subject) || {};
    const required = Number(value(row.years_required, AG_REQUIREMENTS[subject], 0));
    const completed = Number(value(row.years_completed, 0));
    return {
      subject,
      name: AG_SUBJECT_NAMES[subject] || subject,
      yearsCompleted: completed,
      yearsRequired: required,
      inProgress: Boolean(row.in_progress),
      coursesTaken: row.courses_taken || [],
      currentCourse: row.current_course || null,
      met: completed >= required,
      updatedAt: row.updated_at || null,
    };
  });
}

function normalizeCourses(courses: LegacyValue[] = []) {
  return courses.map((course, index) => ({
    id: String(value(course.id, `course-${index}`)),
    name: value(course.name, course.title, course.course_name, course.current_course, "Untitled course"),
    subject: value(course.subject, course.ag_subject, course.category),
    grade: value(course.grade, course.letter_grade),
    credits: Number(value(course.credits, course.credit, 0)),
    term: value(course.term, course.semester),
    schoolYear: value(course.school_year, course.schoolYear, course.year),
    level: value(course.level, course.course_level),
    status: value(course.status, course.completed ? "completed" : course.in_progress ? "in_progress" : null),
  }));
}

export function buildScholarRecord(input: ScholarRecordInput = {}): ScholarRecord {
  const profile = input.profile || input.rawProfile || {};
  const agProgress = normalizeAgProgress(input.agProgress || input.ag_progress || []);
  const courseHistory = normalizeCourses(input.courses || input.courseHistory || []);
  const currentCourses = normalizeCourses(input.currentCourses || []).concat(
    agProgress.filter((row) => row.currentCourse).map((row) => ({
      id: `${row.subject}-current`, name: row.currentCourse, subject: row.subject, grade: null, credits: 0, term: null, schoolYear: null, level: null, status: "in_progress",
    }))
  );
  const creditsEarned = Number(value(profile.credits_earned, input.academicSummary?.creditsEarned, courseHistory.reduce((sum, course) => sum + Number(course.credits || 0), 0), 0));
  const subjectsMet = agProgress.filter((row) => row.met).length;
  const totalRequired = agProgress.reduce((sum, row) => sum + row.yearsRequired, 0);
  const totalCompleted = agProgress.reduce((sum, row) => sum + Math.min(row.yearsCompleted, row.yearsRequired), 0);
  const achievements = { certificates: input.certificates || [], badges: input.badges || [], activities: input.activities || [], posts: input.posts || [] };
  const totalAchievements = achievements.certificates.length + achievements.badges.length + achievements.activities.length + achievements.posts.length;
  const community = buildCommunityRecord(achievements.activities);
  const volunteerHours = community.volunteerHours;
  const fullName = value(profile.full_name, [profile.first_name, profile.last_name].filter(Boolean).join(" "), profile.username, "Scholar") || "Scholar";
  const academicFields = [profile.school, profile.grade, profile.grad_year, profile.weighted_gpa || profile.gpa, profile.unweighted_gpa, profile.sat_score, profile.act_score, profile.dream_school].filter(Boolean).length;
  const portfolioCompletion = Math.min(100, Math.round((academicFields / 8) * 100));
  return {
    id: profile.id || "",
    rawProfile: profile,
    identity: { username: profile.username, role: profile.role, fullName, firstName: profile.first_name, lastName: profile.last_name, avatarUrl: profile.avatar_url || null, bio: profile.bio || null, school: profile.school || null, grade: profile.grade || null, graduationYear: value(profile.grad_year, profile.graduation_year) },
    academics: {
      school: profile.school || null,
      grade: profile.grade || null,
      currentGradeLevel: profile.grade || null,
      graduationYear: value(profile.grad_year, profile.graduation_year),
      gpa: value(profile.gpa, profile.weighted_gpa, profile.unweighted_gpa),
      weightedGpa: value(profile.weighted_gpa, profile.gpa),
      unweightedGpa: value(profile.unweighted_gpa),
      classRank: value(profile.class_rank),
      creditsEarned,
      dreamSchool: profile.dream_school || null,
      intendedMajor: profile.intended_major || null,
      sat: { total: value(profile.sat_score), evidence: [] },
      act: { composite: value(profile.act_score), evidence: [] },
      ap: input.ap || [], ib: input.ib || [], dualEnrollment: input.dualEnrollment || [], academicHonors: input.academicHonors || [],
      agProgress,
      agSummary: { subjectsMet, subjectCount: SUBJECTS.length, totalCompleted, totalRequired, percent: totalRequired ? Math.round((totalCompleted / totalRequired) * 100) : 0 },
      currentCourses,
      courseHistory,
      semesterHistory: input.semesterHistory || [],
      transcriptMetadata: { source: input.transcriptMetadata?.source || "supabase", importedAt: input.transcriptMetadata?.importedAt || null, lastUpdatedAt: value(profile.updated_at, agProgress.find((r) => r.updatedAt)?.updatedAt), verified: Boolean(input.transcriptMetadata?.verified) },
    },
    career: { idealProfession: profile.ideal_profession || null, desiredSalaryRange: profile.desired_salary_range || null },
    community,
    achievements: { total: totalAchievements, ...achievements, activities: community.activities },
    service: { volunteerHours, activities: community.activities },
    leadership: {
      badges: achievements.badges,
      activities: community.activities,
      leadershipPositions: community.leadershipPositions,
      leadershipScore: achievements.badges.length * 10 + community.leadershipPositions.length * 12 + community.activities.length * 3,
    },
    readiness: {
      portfolioCompletion,
      opportunityReadiness: Math.min(100, Math.round(portfolioCompletion * 0.55 + Math.min(totalAchievements, 10) * 3 + Math.min(volunteerHours, 100) * 0.15)),
    },
    ai: { academicSummary: null, collegeRecommendations: null, transcriptAnalysis: null, scholarshipEligibility: null, academicCoaching: null, progressForecasting: null },
  };
}

export function scholarRecordToProfileForm(record: ScholarRecord): ProfileAcademicForm {
  const a = record.academics;
  return { school: a.school || "", grade: a.currentGradeLevel || "", gradYear: a.graduationYear || "", weightedGpa: a.weightedGpa || "", unweightedGpa: a.unweightedGpa || "", satScore: a.sat.total || "", actScore: a.act.composite || "", intendedMajor: a.intendedMajor || "", dreamSchool: a.dreamSchool || "" };
}
