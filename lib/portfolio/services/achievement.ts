export function getAchievementSummary({ certificates = [], badges = [], activities = [] }: any) {
  return {
    certificateCount: certificates.length,
    badgeCount: badges.length,
    activityCount: activities.length,
  };
}
