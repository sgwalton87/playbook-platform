import type { ScholarRecordArtifact } from "../types";

function getHours(activity: ScholarRecordArtifact): number {
  const hours = Number(activity.hours ?? 0);
  return Number.isFinite(hours) ? hours : 0;
}

export function buildService(
  activities: ScholarRecordArtifact[] = []
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
