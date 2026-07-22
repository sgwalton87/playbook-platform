import { buildPlaybookRecord } from "./buildPlaybookRecord";
import type { PlaybookRecord } from "./types";

export type PlaybookRecordDependencies = {
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

export async function assemblePlaybookRecord({
  userId,
  authEmail,
  includeAcademicData = true,
  dependencies,
}: {
  userId: string;
  authEmail?: string | null;
  includeAcademicData?: boolean;
  dependencies: PlaybookRecordDependencies;
}): Promise<PlaybookRecord | null> {
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

  return buildPlaybookRecord({
    profile,
    authEmail,
    agProgress,
    transcriptCourses,
  });
}
