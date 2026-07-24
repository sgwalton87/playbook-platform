import { buildCommunityRecord, type RawCommunityActivity } from "../community";

export function buildService(activities: RawCommunityActivity[] = []) {
  const community = buildCommunityRecord(activities);

  return {
    volunteerHours: community.volunteerHours,
    activities: community.activities,
  };
}
