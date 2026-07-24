export function getAchievementSummary({ certificates = [], badges = [], activities = [] }: LegacyValue) {
  return {
    certificateCount: certificates.length,
    badgeCount: badges.length,
    activityCount: activities.length,
  };
}
