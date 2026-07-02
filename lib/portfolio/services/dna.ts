export function calculatePortfolioDNA({ portfolio, certificates = [], activities = [] }: any) {
  const pillars = portfolio?.pillars || [];

  return {
    leadership: score([
      pillars.includes("leadership"),
      activities.some((a: any) => Boolean(a.role_title)),
    ]),
    financialLiteracy: score([
      pillars.includes("finance"),
      certificates.some((c: any) => String(c.course_slug || c.certificate_name || "").toLowerCase().includes("money")),
    ]),
    communityImpact: score([
      pillars.includes("civic"),
      activities.some((a: any) => String(a.activity_type || "").toLowerCase().includes("volunteer")),
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
