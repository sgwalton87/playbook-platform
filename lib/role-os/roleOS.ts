export type PlaybookRoleOS =
  | "learner"
  | "family"
  | "educator"
  | "counselor"
  | "coach"
  | "district"
  | "university"
  | "recruiter"
  | "admissions"
  | "employer"
  | "mentor"
  | "transition-youth"
  | "community";

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
    counselor: {
      title: "Counselor OS",
      audience: "High School Counselor",
      headline: "Coordinate the path from readiness to enrollment.",
      focus: ["Academic Planning", "Applications", "Interventions", "Trusted Support"],
      primaryAction: "Open Counselor View",
      href: "/counselor-os",
    },
    coach: {
      title: "Coach OS",
      audience: "High School Coach",
      headline: "Connect the athlete, classroom, team, and next level.",
      focus: ["Roster Authority", "Academic Readiness", "Recruiting", "Athlete Advocacy"],
      primaryAction: "Open Coach View",
      href: "/coach-os",
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
    recruiter: {
      title: "Recruiting OS",
      audience: "College Coach / Recruiter",
      headline: "Discover verified talent through consented recruiting pathways.",
      focus: ["Verified Athletes", "Program Fit", "Eligibility", "Recruiting Communication"],
      primaryAction: "Open Recruiting View",
      href: "/recruiting-os",
    },
    admissions: {
      title: "Admissions OS",
      audience: "College Admissions",
      headline: "Connect verified readiness to the right institutional path.",
      focus: ["Verified Scholars", "Admissions Criteria", "Applications", "Enrollment Pathways"],
      primaryAction: "Open Admissions View",
      href: "/admissions-os",
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
    "transition-youth": {
      title: "Transition-Aged Youth OS",
      audience: "Transition-Aged Youth",
      headline: "Build a supported path toward education, work, and independent adulthood.",
      focus: ["Life Plan", "Education", "Employment", "Trusted Support"],
      primaryAction: "Open TAY View",
      href: "/transition-youth-os",
    },
    community: {
      title: "Community Partner OS",
      audience: "Community Partner",
      headline: "Turn trusted community capacity into accountable scholar support.",
      focus: ["Organization Authority", "Programs", "Referrals", "Community Outcomes"],
      primaryAction: "Open Community View",
      href: "/community-partner-os",
    },
  };

  return systems[role];
}

export function getAllRoleOS() {
  return [
    getRoleOS("learner"),
    getRoleOS("family"),
    getRoleOS("educator"),
    getRoleOS("counselor"),
    getRoleOS("coach"),
    getRoleOS("district"),
    getRoleOS("university"),
    getRoleOS("recruiter"),
    getRoleOS("admissions"),
    getRoleOS("employer"),
    getRoleOS("mentor"),
    getRoleOS("transition-youth"),
    getRoleOS("community"),
  ];
}
