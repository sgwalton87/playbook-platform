import type { ScholarRecordArtifact } from "../types";

export function buildLeadership(
  badges: ScholarRecordArtifact[] = [],
  activities: ScholarRecordArtifact[] = []
) {
  return {
    badges,
    activities,
    leadershipScore:
      badges.length * 10 +
      activities.length * 5,
  };
}
