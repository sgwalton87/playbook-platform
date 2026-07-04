export function buildResumeProfile(input: {
  name: string;
  headline?: string;
  education?: string[];
  experience?: string[];
  leadership?: string[];
  athletics?: string[];
  awards?: string[];
  skills?: string[];
  projects?: string[];
}) {
  return {
    name: input.name,
    headline: input.headline || "Emerging scholar and future-ready leader",
    sections: {
      education: input.education || [],
      experience: input.experience || [],
      leadership: input.leadership || [],
      athletics: input.athletics || [],
      awards: input.awards || [],
      skills: input.skills || [],
      projects: input.projects || [],
    },
  };
}

export function scoreResumeReadiness(resume: ReturnType<typeof buildResumeProfile>) {
  const sections = Object.values(resume.sections);
  const filled = sections.filter((section) => section.length > 0).length;

  return {
    score: Math.round((filled / sections.length) * 100),
    filledSections: filled,
    totalSections: sections.length,
  };
}
