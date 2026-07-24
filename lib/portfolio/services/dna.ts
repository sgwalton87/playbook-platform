export function calculatePortfolioDNA({ portfolio, certificates = [], activities = [] }: LegacyValue) {
  const pillars = portfolio?.pillars || [];

  return {
    leadership: score([
      pillars.includes("leadership"),
      activities.some((a: LegacyValue) => Boolean(a.role_title)),
    ]),
    financialLiteracy: score([
      pillars.includes("finance"),
      certificates.some((c: LegacyValue) => String(c.course_slug || c.certificate_name || "").toLowerCase().includes("money")),
    ]),
    communityImpact: score([
      pillars.includes("civic"),
      activities.some((a: LegacyValue) => String(a.activity_type || "").toLowerCase().includes("volunteer")),
    ]),
    wellness: score([pillars.includes("sel")]),
    careerReadiness: score([
      Boolean(portfolio?.career?.idealProfession),
      Boolean(portfolio?.career?.desiredSalaryRange),
    ]),
    collegeReadiness: score([
      Boolean(portfolio?.academics?.dreamSchool),
      Boolean(portfolio?.academics?.weightedGpa || portfolio?.academics?.unweightedGpa),
    ]),
  };
}

function score(values: boolean[]) {
  return values.length ? Math.round((values.filter(Boolean).length / values.length) * 100) : 0;
}
