import { average, statusFromScore } from "../utils";

export function buildAcademicReadinessScore({
  graduationProgress,
  agProgress,
  gpa,
  transcriptComplete,
}: {
  graduationProgress: number;
  agProgress: number;
  gpa: number;
  transcriptComplete: boolean;
}) {
  const gpaScore = Math.min(100, Math.round((gpa / 4) * 100));
  const transcriptScore = transcriptComplete ? 100 : 0;

  const score = average([graduationProgress, agProgress, gpaScore, transcriptScore]);

  return {
    score,
    status: statusFromScore(score),
  };
}
