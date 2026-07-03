export type DemoAudience =
  | "student"
  | "family"
  | "counselor"
  | "district"
  | "investor"
  | "university"
  | "employer";

export function getDemoDirectorAudiences() {
  return [
    {
      audience: "student",
      title: "Student Demo",
      focus: "Daily guidance, opportunities, Academic DNA, and next steps.",
      path: "/living-scholar",
    },
    {
      audience: "family",
      title: "Family Demo",
      focus: "Progress visibility, support actions, scholarships, and trust.",
      path: "/demo",
    },
    {
      audience: "counselor",
      title: "Counselor Demo",
      focus: "Risk signals, A-G progress, interventions, and verified evidence.",
      path: "/journey",
    },
    {
      audience: "district",
      title: "District Demo",
      focus: "Equity, readiness, documentation, and opportunity access.",
      path: "/demo",
    },
    {
      audience: "investor",
      title: "Investor Demo",
      focus: "Platform architecture, market story, intelligence layer, and scalability.",
      path: "/demo",
    },
    {
      audience: "university",
      title: "University Demo",
      focus: "Verified learner records, readiness signals, and recruitment pathways.",
      path: "/journey",
    },
    {
      audience: "employer",
      title: "Employer Demo",
      focus: "Skills, evidence, verified growth, and career pathway matching.",
      path: "/opportunities",
    },
  ];
}
