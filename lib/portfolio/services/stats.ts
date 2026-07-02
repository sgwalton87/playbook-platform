export function calculatePortfolioStats({ rawProfile, certificates = [], badges = [], posts = [], activities = [] }: any) {
  const xp = Number(rawProfile?.xp ?? 0);
  const coins = Number(rawProfile?.coin_balance ?? 0);

  return {
    xp,
    coins,
    level: Math.max(1, Math.floor(xp / 500) + 1),
    certificateCount: certificates.length,
    badgeCount: badges.length,
    postCount: posts.length,
    activityCount: activities.length,
  };
}
