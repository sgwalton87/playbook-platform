import { buildScholarRecord } from "./buildScholarRecord";
import type { ScholarRecord } from "./types";

export type ScholarRecordDependencies = {
  loadProfile: (
    userId: string
  ) => Promise<Record<string, any> | null>;

  loadAgProgress?: (
    userId: string
  ) => Promise<Array<Record<string, unknown>>>;

  loadTranscriptCourses?: (
    userId: string
  ) => Promise<Array<Record<string, unknown>>>;
};

export async function assembleScholarRecord({
  userId,
  authEmail,
  includeAcademicData = true,
  dependencies,
}: {
  userId: string;
  authEmail?: string | null;
  includeAcademicData?: boolean;
  dependencies: ScholarRecordDependencies;
}): Promise<ScholarRecord | null> {
  const profile =
    await dependencies.loadProfile(userId);

  if (!profile) return null;

  const [agProgress, transcriptCourses] =
    includeAcademicData
      ? await Promise.all([
          dependencies.loadAgProgress?.(userId) ??
            Promise.resolve([]),

          dependencies.loadTranscriptCourses?.(
            userId
          ) ?? Promise.resolve([]),
        ])
      : [[], []];

  return buildScholarRecord({
    profile,
    authEmail,
    agProgress,
    transcriptCourses,
  });
}
