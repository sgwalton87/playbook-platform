export function buildScholarApplicationData(input: {
  profile?: LegacyValue;
  courses?: LegacyValue[];
  certificates?: LegacyValue[];
  evidence?: LegacyValue[];
  goals?: LegacyValue[];
  athletics?: LegacyValue[];
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
      courses: data.courses.map((c: LegacyValue) => c.title || c.name).filter(Boolean),
      certificates: data.certificates.map((c: LegacyValue) => c.title || c.name).filter(Boolean),
      evidence: data.evidence.map((e: LegacyValue) => e.title || e.name).filter(Boolean),
      goals: data.goals.map((g: LegacyValue) => g.title || g.name).filter(Boolean),
      athletics: data.athletics.map((a: LegacyValue) => a.sport || a.title).filter(Boolean),
    },
  };
}
