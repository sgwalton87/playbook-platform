import type { PlaybookRecordArtifact } from "../types";

export function buildLeadership(
  badges: PlaybookRecordArtifact[] = [],
  activities: PlaybookRecordArtifact[] = []
) {
  return {
    badges,
    activities,
    leadershipScore:
      badges.length * 10 +
      activities.length * 5,
  };
}
