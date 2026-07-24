export const getProfileProgress = (profile: LegacyValue) => {
  if (!profile) {
    return {
      percent: 0,
      filled: 0,
      total: 0,
    };
  }

  const fields = [
    profile.first_name,
    profile.last_name,
    profile.gender,
    profile.school,
    profile.sport,
    profile.location,
    profile.date_of_birth,
    profile.grad_year,
    profile.gpa,
  ];

  const filled = fields.filter((f) => f !== null && f !== "").length;
  const total = fields.length;

  return {
    percent: Math.round((filled / total) * 100),
    filled,
    total,
  };
};