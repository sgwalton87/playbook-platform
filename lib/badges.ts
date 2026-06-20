export const computeBadges = (profile: any) => {
  const badges: string[] = [];

  if (profile?.first_name && profile?.last_name) {
    badges.push("Identity Complete");
  }

  if (profile?.school) {
    badges.push("Student");
  }

  if (profile?.sport) {
    badges.push("Athlete");
  }

  if (profile?.school && profile?.sport) {
    badges.push("Student Athlete");
  }

  if (
    profile?.first_name &&
    profile?.last_name &&
    profile?.gender &&
    profile?.school &&
    profile?.sport &&
    profile?.location
  ) {
    badges.push("Profile Complete");
  }

  if (profile?.gpa && Number(profile.gpa) >= 3.0) {
    badges.push("Scholar");
  }

  if ((profile?.xp || 0) >= 100) {
    badges.push("First 100 XP");
  }

  if ((profile?.xp || 0) >= 500) {
    badges.push("Rising Star");
  }

  return badges;
};

// keeps older pages working
export const checkBadges = computeBadges;