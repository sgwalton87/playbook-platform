export type PlaybookRoleOS =
  | "learner"
  | "family"
  | "educator"
  | "district"
  | "university"
  | "employer"
  | "mentor";

export function getRoleOS(role: PlaybookRoleOS) {
  const systems = {
    learner: {
      title: "Learner OS",
      audience: "Scholar",
      headline: "Own your story. Grow your future.",
      focus: ["Academic DNA", "Opportunities", "Compass Guidance", "Scholar Record"],
      primaryAction: "Open Living Scholar",
      href: "/living-scholar",
    },
    family: {
      title: "Family OS",
      audience: "Parent / Guardian",
      headline: "Know how to support your scholar today.",
      focus: ["Progress Briefing", "Deadlines", "Family Actions", "Opportunity Support"],
      primaryAction: "View Family Briefing",
      href: "/family-os",
    },
    educator: {
      title: "Educator OS",
      audience: "Teacher / Counselor / Coach",
      headline: "See who needs support before they fall behind.",
      focus: ["Cohort Signals", "A-G Risk", "Verification Requests", "Interventions"],
      primaryAction: "Review Students",
      href: "/educator-os",
    },
    district: {
      title: "District OS",
      audience: "District Leader",
      headline: "Turn readiness data into equity action.",
      focus: ["Readiness Trends", "Opportunity Gaps", "School Health", "Impact Metrics"],
      primaryAction: "Open District View",
      href: "/district-os",
    },
    university: {
      title: "University OS",
      audience: "Admissions / Outreach",
      headline: "Find verified talent earlier.",
      focus: ["Readiness Signals", "Verified Records", "Pathway Fit", "Recruitment"],
      primaryAction: "Explore Scholars",
      href: "/university-os",
    },
    employer: {
      title: "Employer OS",
      audience: "Employer / Workforce Partner",
      headline: "Match opportunity to verified growth.",
      focus: ["Skills Evidence", "Career Pathways", "Trust Signals", "Workforce Readiness"],
      primaryAction: "View Talent Pipeline",
      href: "/employer-os",
    },
    mentor: {
      title: "Mentor OS",
      audience: "Mentor / Trusted Adult",
      headline: "Know who you are helping and what they need next.",
      focus: ["Weekly Check-ins", "Scholar Goals", "Opportunity Coaching", "Encouragement"],
      primaryAction: "Open Mentor View",
      href: "/mentor-os",
    },
  };

  return systems[role];
}

export function getAllRoleOS() {
  return [
    getRoleOS("learner"),
    getRoleOS("family"),
    getRoleOS("educator"),
    getRoleOS("district"),
    getRoleOS("university"),
    getRoleOS("employer"),
    getRoleOS("mentor"),
  ];
}
