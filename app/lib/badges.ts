export const computeBadges = (profile: LegacyValue) => {
  const badges: string[] = [];

  if (profile?.first_name && profile?.last_name) {
    badges.push("identity_set");
  }

  if (profile?.gender) {
    badges.push("profile_complete");
  }

  if (profile?.school && profile?.sport) {
    badges.push("student_athlete");
  }

  if ((profile?.coin_balance || 0) >= 100) {
    badges.push("coin_collector");
  }

  if ((profile?.xp || 0) >= 500) {
    badges.push("xp_grinder");
  }

  return badges;
};