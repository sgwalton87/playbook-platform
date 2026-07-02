import type { AcademicCourse, AcademicReport } from "./types";
import { analyzeTranscript } from "./transcript/transcriptIntelligence";
import { calculateGPA } from "./gpa/gpaIntelligence";
import { analyzeAGProgress } from "./ag/agIntelligence";
import { analyzeGraduationProgress } from "./graduation/graduationIntelligence";
import { buildAcademicRecommendations } from "./recommendations/recommendationIntelligence";
import { buildAcademicReadinessScore } from "./readiness/readinessIntelligence";

export function buildAcademicIntelligenceReport(courses: AcademicCourse[] = []): AcademicReport {
  const transcript = analyzeTranscript(courses);
  const gpa = calculateGPA(courses);
  const ag = analyzeAGProgress(courses);
  const graduation = analyzeGraduationProgress(courses);

  const readiness = buildAcademicReadinessScore({
    graduationProgress: graduation.graduationProgress,
    agProgress: ag.agProgress,
    gpa,
    transcriptComplete: transcript.transcriptComplete,
  });

  const recs = buildAcademicRecommendations({
    agMissing: ag.missing,
    creditsRemaining: graduation.creditsRemaining,
    courses,
  });

  const strengths = [
    transcript.transcriptComplete && "Transcript data detected.",
    gpa > 0 && `GPA calculated at ${gpa}.`,
    ag.agProgress >= 70 && "Strong A-G progress.",
    graduation.graduationProgress >= 70 && "Strong graduation progress.",
  ].filter(Boolean) as string[];

  const gaps = [
    ...transcript.gaps,
    ...ag.gaps,
    ...graduation.gaps,
  ];

  return {
    score: readiness.score,
    status: readiness.status,
    strengths,
    gaps,
    recommendations: recs.recommendations,
    nextActions: recs.nextActions,
    gpa,
    creditsEarned: graduation.creditsEarned,
    graduationProgress: graduation.graduationProgress,
    agProgress: ag.agProgress,
    collegeReadiness: readiness.score,
  };
}
