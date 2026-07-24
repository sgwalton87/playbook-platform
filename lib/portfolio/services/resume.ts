export function generateResumeDraft(portfolio: LegacyValue) {
  return {
    name: portfolio?.identity?.fullName || "Scholar",
    headline: portfolio?.career?.idealProfession || "Emerging Scholar",
    education: portfolio?.identity?.school || "",
    dreamSchool: portfolio?.academics?.dreamSchool || "",
    skills: portfolio?.pillars || [],
  };
}
