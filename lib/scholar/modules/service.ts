import type { PlaybookRecordArtifact } from "../types";

function getHours(activity: PlaybookRecordArtifact): number {
  const hours = Number(activity.hours ?? 0);
  return Number.isFinite(hours) ? hours : 0;
}

export function buildService(
  activities: PlaybookRecordArtifact[] = []
) {
  const volunteerHours = activities.reduce(
    (total, activity) => total + getHours(activity),
    0
  );

  return {
    volunteerHours,
    activities,
  };
}
