export type UserPathway = {
  role: string;
  label: string;
  short: string;
  full: string;
  nextStep: string;
};

export const USER_PATHWAYS: UserPathway[] = [
  {
    role: "scholar",
    label: "Scholar",
    short: "Track academics, opportunities, community, rewards.",
    full: "Scholars use The Playbook to upload transcripts, track A-G readiness, build a Scholar Record, discover opportunities, connect with support, complete courses, earn rewards, and plan their next move.",
    nextStep: "After confirming your email, you will complete onboarding and begin your Scholar Journey.",
  },
  {
    role: "scholar-athlete",
    label: "Scholar-Athlete",
    short: "Add sports, recruiting, NIL, and transition support.",
    full: "Scholar-athletes use The Playbook to connect academic readiness with athletics, recruiting, NIL education, eligibility, career planning, mentorship, and life after the game.",
    nextStep: "After confirming your email, you will build your academic and athletic profile.",
  },
  {
    role: "family",
    label: "Family",
    short: "Support a scholar’s journey and next actions.",
    full: "Family users help scholars stay on track by viewing next actions, progress signals, messages, invitations, opportunities, and support tasks.",
    nextStep: "After confirming your email, you will connect to your scholar or request access.",
  },
  {
    role: "mentor",
    label: "Mentor",
    short: "Guide scholars through goals and opportunity pathways.",
    full: "Mentors help scholars make informed decisions, respond to goals, support applications, and provide guidance through important academic, career, and life transitions.",
    nextStep: "After confirming your email, your mentor profile can be reviewed and connected to scholars.",
  },
  {
    role: "educator",
    label: "Educator",
    short: "Support academic readiness and student progress.",
    full: "Educators support transcript review, academic readiness, A-G progress, course planning, student goals, and intervention pathways.",
    nextStep: "After confirming your email, your educator access can be reviewed.",
  },
  {
    role: "coach",
    label: "Coach",
    short: "Support athlete development, eligibility, and recruiting.",
    full: "Coaches help scholar-athletes connect athletic development with academics, eligibility, recruitment, leadership, and transition planning.",
    nextStep: "After confirming your email, your coach access can be reviewed.",
  },
  {
    role: "district",
    label: "District",
    short: "View readiness, supports, and implementation tools.",
    full: "District users use The Playbook to understand readiness trends, support implementation, coordinate services, and strengthen student opportunity pathways.",
    nextStep: "After confirming your email, your organization access can be reviewed.",
  },
  {
    role: "university",
    label: "University",
    short: "Connect with prepared scholars and pathways.",
    full: "University users can connect with prepared scholars, pathway programs, student records, and opportunity pipelines.",
    nextStep: "After confirming your email, your university access can be reviewed.",
  },
  {
    role: "employer",
    label: "Employer",
    short: "Offer internships, work-based learning, and career paths.",
    full: "Employers can support internships, work-based learning, apprenticeships, career exploration, and opportunity pathways for scholars.",
    nextStep: "After confirming your email, your employer access can be reviewed.",
  },
  {
    role: "brand-partner",
    label: "Brand Partner — Coming Soon",
    short: "Coming soon. Brand partner access will require admin approval.",
    full: "Brand partners can support rewards, student visibility, NIL education, campaigns, sponsorship pathways, and community investment.",
    nextStep: "After confirming your email, your brand partner access can be reviewed.",
  },
];

export function getUserPathway(role?: string | null) {
  return USER_PATHWAYS.find((pathway) => pathway.role === role) || USER_PATHWAYS[0];
}
