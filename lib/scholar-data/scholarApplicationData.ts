export function buildScholarApplicationData(input: {
  profile?: any;
  courses?: any[];
  certificates?: any[];
  evidence?: any[];
  goals?: any[];
  athletics?: any[];
}) {
  const profile = input.profile || {};

  return {
    name:
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      profile.full_name ||
      "Scholar",
    headline:
      profile.headline ||
      "Emerging scholar and future-ready leader",
    education: profile.school ? [profile.school] : [],
    courses: input.courses || [],
    certificates: input.certificates || [],
    evidence: input.evidence || [],
    goals: input.goals || [],
    athletics: input.athletics || [],
  };
}

export function buildResumeFromScholarData(data: ReturnType<typeof buildScholarApplicationData>) {
  return {
    name: data.name,
    headline: data.headline,
    sections: {
      education: data.education,
      courses: data.courses.map((c: any) => c.title || c.name).filter(Boolean),
      certificates: data.certificates.map((c: any) => c.title || c.name).filter(Boolean),
      evidence: data.evidence.map((e: any) => e.title || e.name).filter(Boolean),
      goals: data.goals.map((g: any) => g.title || g.name).filter(Boolean),
      athletics: data.athletics.map((a: any) => a.sport || a.title).filter(Boolean),
    },
  };
}
