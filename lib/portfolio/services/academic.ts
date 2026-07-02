export function calculateAcademicCompletion(portfolio: any): number {
  const fields = [
    portfolio?.academics?.weightedGpa,
    portfolio?.academics?.unweightedGpa,
    portfolio?.academics?.dreamSchool,
    portfolio?.academics?.intendedMajor,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}
