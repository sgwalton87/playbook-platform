import { buildAcademicIntelligence } from "@/lib/academic-intelligence";
import { createAcademicTimelineEvent } from "@/lib/repositories/academicRepository";

export async function handleTranscriptImportedForAcademic(payload: any) {
  if (!payload?.recordId) return;

  const report = buildAcademicIntelligence(payload.courses || []);

  await createAcademicTimelineEvent({
    recordId: payload.recordId,
    title: "Academic Intelligence updated",
    description: `College readiness ${report.collegeReadiness}%. Graduation progress ${report.graduationProgress}%.`,
    profileId: payload.profileId,
  });

  return report;
}

export async function handleCourseCompletedForAcademic(payload: any) {
  if (!payload?.recordId || !payload?.courseName) return;

  await createAcademicTimelineEvent({
    recordId: payload.recordId,
    title: "Course completed",
    description: `${payload.courseName} was added to the academic record.`,
    profileId: payload.profileId,
  });
}
