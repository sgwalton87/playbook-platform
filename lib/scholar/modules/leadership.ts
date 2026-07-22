import { buildCommunityRecord, type RawCommunityActivity } from "../community";

export function buildLeadership(badges: unknown[] = [], activities: RawCommunityActivity[] = []) {
  const community = buildCommunityRecord(activities);

  return {
    badges,
    activities: community.activities,
    leadershipPositions: community.leadershipPositions,
    leadershipScore: badges.length * 10 + community.leadershipPositions.length * 12 + community.activities.length * 3,
  };
}
