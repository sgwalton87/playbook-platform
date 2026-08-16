export type UserPathway = {
  role: string;
  label: string;
  short: string;
  full: string;
  nextStep: string;
  entryMode?: "self-service" | "scholar-invitation";
};

export const USER_PATHWAYS: UserPathway[] = [
  {
    role: "scholar",
    label: "Scholar",
    short: "Academics, college prep, internships, and scholarships.",
    full: "Scholars use The Playbook to build a public profile, track academics, discover opportunities, and connect with support.",
    nextStep: "After confirming your email, you will complete Scholar onboarding.",
  },
  {
    role: "scholar-athlete",
    label: "Scholar-Athlete",
    short: "Academics, recruiting, eligibility, NIL, and life after sports.",
    full: "Scholar-athletes use The Playbook to connect academics, athletics, recruiting, NIL education, support networks, and transition planning.",
    nextStep: "After confirming your email, you will complete Scholar-Athlete onboarding.",
  },
  {
    role: "brand-partner",
    label: "Brand Partner",
    short: "Campaigns, rewards, sponsorship, internships, and NIL education.",
    full: "Brand partners help power opportunity by creating campaigns, rewards, sponsorship pathways, NIL education, internships, and scholar-athlete support.",
    nextStep: "After confirming your email, you will complete Brand Partner onboarding.",
  },
  {
    role: "family",
    label: "Parent / Guardian",
    short: "Monitor, pay, support, and help your scholar stay on track.",
    full: "Families support scholars through academic monitoring, athletic recruiting, financial aid, scholarships, and communication.",
    nextStep: "After confirming your email, you will complete Family onboarding.",
  },
  {
    role: "mentor",
    label: "Mentor",
    short: "Scholar invitation required, followed by support-system validation.",
    full: "Mentors offer guidance, expertise, recommendations, career support, and trusted adult relationships only after a Scholar invitation and the governed validation threshold.",
    nextStep: "Use the Scholar invitation link to create or sign in to your account, complete Mentor onboarding, and enter Mentor OS for validation.",
    entryMode: "scholar-invitation",
  },
  {
    role: "educator",
    label: "Teacher / Educator",
    short: "References, recommendations, academic progress, and support.",
    full: "Teachers and educators support student progress, character references, recommendation letters, and academic readiness.",
    nextStep: "After confirming your email, you will complete Educator onboarding.",
  },
  {
    role: "high-school-counselor",
    label: "High School Counselor",
    short: "Academic planning, applications, student support, and interventions.",
    full: "High school counselors coordinate academic planning, applications, trusted support, and permission-scoped student interventions.",
    nextStep: "After confirming your email, you will complete Counselor onboarding.",
  },
  {
    role: "coach",
    label: "High School Coach",
    short: "Roster support, player advocacy, film, and recruiting recommendations.",
    full: "High school coaches help manage athletes, advocate for players, support eligibility, and connect scholar-athletes to recruiting opportunities.",
    nextStep: "After confirming your email, you will complete High School Coach onboarding.",
  },
  {
    role: "college-coach",
    label: "College Coach / Recruiter",
    short: "Search talent, recruiting scope, contact preferences, and compliance.",
    full: "College coaches and recruiters use The Playbook to discover talent, clarify recruiting needs, and support compliant communication.",
    nextStep: "After confirming your email, you will complete College Coach onboarding.",
  },
  {
    role: "college-admissions",
    label: "College Admissions Officer",
    short: "Academic talent discovery outside of athletics.",
    full: "Admissions officers use The Playbook to identify academic talent, share opportunities, and connect students to institutional pathways.",
    nextStep: "After confirming your email, you will complete Admissions onboarding.",
  },
  {
    role: "transition-youth",
    label: "Transition-Aged Youth",
    short: "Scholar support plus life, work, education, and optional athletics.",
    full: "Transition-aged youth can build a Playbook around education, work, housing/support context, career goals, and optional athletics.",
    nextStep: "After confirming your email, you will complete TAY onboarding.",
  },
  {
    role: "employer",
    label: "Employer",
    short: "Internships, work-based learning, hiring pathways, and career exposure.",
    full: "Employers create opportunities for internships, apprenticeships, work-based learning, and career exploration.",
    nextStep: "After confirming your email, you will complete Employer onboarding.",
  },
  {
    role: "district",
    label: "District / School Administrator",
    short: "School governance, cohorts, readiness signals, and scoped support.",
    full: "District and school administrators coordinate verified institutions, cohorts, permissions, readiness signals, and accountable interventions.",
    nextStep: "After confirming your email, you will complete District onboarding.",
  },
  {
    role: "athlete-abroad",
    label: "Athlete Abroad",
    short: "Academics, eligibility, travel readiness, recruiting, and global transition.",
    full: "Athletes preparing for international pathways connect academic evidence, eligibility, recruiting, travel readiness, and trusted support.",
    nextStep: "After confirming your email, you will complete Athlete Abroad onboarding.",
  },
  {
    role: "other",
    label: "Community Partner",
    short: "Programs, referrals, resources, events, and accountable community support.",
    full: "Community partners connect verified programs, services, referrals, events, and local capacity to the Scholar journey through explicit relationship scope.",
    nextStep: "After confirming your email, you will complete Community Partner onboarding and enter Community Partner OS for authority review.",
  },
];

export function getUserPathway(role?: string | null) {
  return USER_PATHWAYS.find((pathway) => pathway.role === role) || USER_PATHWAYS[0];
}
