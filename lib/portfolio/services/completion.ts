export function calculatePortfolioCompletion(portfolio: LegacyValue) {
  const requirements = [
    { id: "identity", label: "Name and biography", complete: Boolean(portfolio?.identity?.fullName && portfolio?.identity?.bio) },
    { id: "photo", label: "Profile photo", complete: Boolean(portfolio?.identity?.avatarUrl) },
    { id: "school", label: "School and grade", complete: Boolean(portfolio?.identity?.school && portfolio?.identity?.grade) },
    { id: "academics", label: "Academic baseline", complete: Boolean(portfolio?.academics?.weightedGpa || portfolio?.academics?.unweightedGpa) },
    { id: "goals", label: "College or career goal", complete: Boolean(portfolio?.academics?.dreamSchool || portfolio?.career?.idealProfession) },
    { id: "evidence", label: "At least one evidence item", complete: Number(portfolio?.evidenceCount || 0) > 0 },
    { id: "verified-evidence", label: "At least one verified evidence item", complete: Number(portfolio?.verifiedEvidenceCount || 0) > 0 },
  ];

  const completed = requirements.filter((requirement) => requirement.complete).length;
  const total = requirements.length;

  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
    ready: completed === total,
    requirements,
    gaps: requirements.filter((requirement) => !requirement.complete),
  };
}
