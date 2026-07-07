export type OnboardingField = {
  key: string;
  label: string;
  placeholder?: string;
  type?:
    | "text"
    | "textarea"
    | "select"
    | "multi-select"
    | "college"
    | "college-list"
    | "district"
    | "career"
    | "activity-list"
    | "invite-list";
  options?: string[];
};

export type OnboardingStep = {
  id: string;
  phase: string;
  title: string;
  body: string;
  fields: OnboardingField[];
};

const IDENTITY = (roleLabel: string): OnboardingStep => ({
  id: "identity",
  phase: "Phase 1 · Identity",
  title: `Create your ${roleLabel} profile.`,
  body: "Your name, handle, photo, and story help personalize your Playbook experience.",
  fields: [
    { key: "full_name", label: "Full name", placeholder: "Your name" },
    { key: "username", label: "Username / handle", placeholder: "ex: futureleader" },
    { key: "bio", label: "Short bio", type: "textarea", placeholder: "Tell the community who you are and why you are here." },
  ],
});

const SCHOLAR_SUPPORT_DATA: OnboardingStep = {
  id: "scholar-support-data",
  phase: "Phase 2 · Support Data",
  title: "Tell us how to support you.",
  body: "This private information helps The Playbook understand who we serve and pursue funding. You may skip any question.",
  fields: [
    { key: "race_ethnicity", label: "Race/ethnicity", type: "multi-select", options: ["Black/African American", "Latino/a/e", "Indigenous/Native American", "AAPI", "Pacific Islander", "White", "Multiracial", "Prefer not to say", "Self-describe"] },
    { key: "lgbtqia_affinity", label: "LGBTQIA+ identity or allyship", type: "select", options: ["LGBTQIA+", "Questioning", "Ally", "Prefer not to say"] },
    { key: "first_generation", label: "First-generation college student?", type: "select", options: ["Yes", "No", "Not sure", "Prefer not to say"] },
    { key: "ell_status", label: "English learner / multilingual learner?", type: "select", options: ["Yes", "No", "Former ELL", "Not sure", "Prefer not to say"] },
    { key: "free_reduced_lunch", label: "Free or reduced-price lunch eligible?", type: "select", options: ["Yes", "No", "Not sure", "Prefer not to say"] },
    { key: "foster_youth", label: "Foster youth / former foster youth?", type: "select", options: ["Yes", "No", "Prefer not to say"] },
    { key: "housing_insecurity", label: "Housing insecurity experience?", type: "select", options: ["Yes", "No", "Prefer not to say"] },
  ],
};

const SCHOLAR_ACADEMICS: OnboardingStep = {
  id: "scholar-academics",
  phase: "Phase 3 · Academics",
  title: "Map your academic path.",
  body: "This helps us personalize your A-G readiness, transcript, opportunities, and Scholar Record.",
  fields: [
    { key: "school", label: "School", placeholder: "School name" },
    { key: "school_district", label: "California school district", type: "district", placeholder: "Start typing your district..." },
    { key: "grade", label: "Grade", type: "select", options: ["8", "9", "10", "11", "12", "College", "Transition-age youth", "Other"] },
    { key: "gpa", label: "Current GPA", placeholder: "ex: 3.4" },
    { key: "dream_school", label: "Dream school", type: "college", placeholder: "Start typing any college..." },
    { key: "top_schools", label: "Top 10 schools", type: "college-list", placeholder: "Start typing any college..." },
  ],
};

const SCHOLAR_GOALS: OnboardingStep = {
  id: "scholar-goals",
  phase: "Phase 4 · Future Vision",
  title: "Name your future.",
  body: "Tell us what future you are building so Compass can guide your next moves.",
  fields: [
    { key: "ideal_profession", label: "Career interest", type: "career", placeholder: "Start typing a career..." },
    { key: "desired_salary_range", label: "Desired future salary range", type: "select", options: ["$40k–$60k", "$60k–$80k", "$80k–$100k", "$100k–$150k", "$150k+", "Not sure yet"] },
    { key: "why_this_goal", label: "Why does this future matter to you?", type: "textarea", placeholder: "Tell us what motivates you." },
  ],
};

const SCHOLAR_ACTIVITIES: OnboardingStep = {
  id: "scholar-activities",
  phase: "Phase 5 · Activities",
  title: "Show the full story.",
  body: "Activities, jobs, leadership, service, family responsibilities, and creativity all belong in your Scholar Record.",
  fields: [
    { key: "activities", label: "Activity entries", type: "activity-list", placeholder: "Add activity details..." },
  ],
};

const ATHLETE_SPORT_PROFILE: OnboardingStep = {
  id: "athlete-sport-profile",
  phase: "Athlete Phase 1 · Sport Identity",
  title: "Build your athlete card.",
  body: "Your athletic profile should tell coaches, mentors, and supporters what you play, where you play, and what you are building.",
  fields: [
    { key: "sport", label: "Sport", type: "select", options: ["Basketball", "Football", "Soccer", "Track & Field", "Volleyball", "Baseball", "Softball", "Cheer", "Dance", "Swimming", "Tennis", "Golf", "Wrestling", "Other"] },
    { key: "position", label: "Position / event", placeholder: "Guard, forward, sprinter, libero..." },
    { key: "height", label: "Height", placeholder: "ex: 5'11" },
    { key: "graduation_year", label: "Graduation year", placeholder: "ex: 2027" },
    { key: "current_team", label: "Current team / club", placeholder: "School, AAU, club, travel team..." },
    { key: "jersey_number", label: "Jersey number", placeholder: "ex: 3" },
  ],
};

const ATHLETE_RECRUITING: OnboardingStep = {
  id: "athlete-recruiting",
  phase: "Athlete Phase 2 · Recruiting",
  title: "Track recruiting readiness.",
  body: "This helps the Scholar-Athlete OS separate academics, eligibility, recruiting, NIL, and transition planning.",
  fields: [
    { key: "recruiting_status", label: "Recruiting status", type: "select", options: ["Just starting", "Have highlights", "Contacted by coaches", "Taking visits", "Have offers", "Committed", "Not sure"] },
    { key: "highlight_link", label: "Highlight/video link", placeholder: "Hudl, YouTube, Instagram, MaxPreps..." },
    { key: "coach_contact", label: "Coach contact", placeholder: "Coach name/email/phone" },
    { key: "eligibility_support_needed", label: "Eligibility support needed?", type: "multi-select", options: ["GPA", "A-G requirements", "NCAA/NAIA eligibility", "SAT/ACT", "Financial aid", "Transfer pathway", "Not sure"] },
  ],
};

const ATHLETE_NIL_TRANSITION: OnboardingStep = {
  id: "athlete-nil-transition",
  phase: "Athlete Phase 3 · NIL + Life After Sports",
  title: "Prepare beyond the game.",
  body: "Scholar-athletes need brand, money, academics, wellness, and career planning early.",
  fields: [
    { key: "nil_interest", label: "NIL / brand interest", type: "multi-select", options: ["Personal brand", "Social media", "Local business partnerships", "Merch", "Financial literacy", "Not sure yet"] },
    { key: "athletic_goals", label: "Athletic goals", type: "textarea", placeholder: "Recruiting, college roster, pro dreams, leadership..." },
    { key: "life_after_sports_goal", label: "Life-after-sports goal", type: "career", placeholder: "Financial advisor, doctor, coach, entrepreneur..." },
  ],
};

const FAMILY_CONTEXT: OnboardingStep = {
  id: "family-context",
  phase: "Family Phase · Scholar Support",
  title: "Tell us who you support.",
  body: "Families need visibility into next steps without replacing the scholar’s ownership.",
  fields: [
    { key: "relationship_to_scholar", label: "Relationship to scholar", type: "select", options: ["Parent", "Guardian", "Grandparent", "Aunt/Uncle", "Sibling", "Caregiver", "Other"] },
    { key: "scholar_name", label: "Scholar name", placeholder: "Who are you supporting?" },
    { key: "support_needs", label: "What support do you want to provide?", type: "multi-select", options: ["College planning", "Financial aid", "Transcript progress", "Transportation", "Mentorship", "Athletics", "Career exposure", "Emotional support"] },
  ],
};

const MENTOR_CONTEXT: OnboardingStep = {
  id: "mentor-context",
  phase: "Mentor Phase · Guidance Profile",
  title: "Create your mentor profile.",
  body: "Mentors should be matched based on expertise, availability, and lived experience.",
  fields: [
    { key: "organization_name", label: "Organization/company", placeholder: "Where are you connected?" },
    { key: "expertise", label: "Areas of expertise", type: "multi-select", options: ["College applications", "Career coaching", "Financial literacy", "Entrepreneurship", "Athletics", "STEM", "Arts/media", "Mental wellness", "Trades"] },
    { key: "availability", label: "Availability", type: "select", options: ["Weekly", "Biweekly", "Monthly", "Events only", "Not sure yet"] },
  ],
};

const EDUCATOR_CONTEXT: OnboardingStep = {
  id: "educator-context",
  phase: "Educator Phase · Student Support",
  title: "Set up educator access.",
  body: "Educators help connect academic readiness, interventions, and opportunity pathways.",
  fields: [
    { key: "school", label: "School/site", placeholder: "School or organization" },
    { key: "school_district", label: "District", type: "district", placeholder: "Start typing district..." },
    { key: "title", label: "Role/title", placeholder: "Teacher, counselor, advisor..." },
    { key: "student_support_focus", label: "Support focus", type: "multi-select", options: ["A-G readiness", "College applications", "FAFSA/CADAA", "Attendance", "Career pathways", "Mentorship", "Intervention"] },
  ],
};

const COACH_CONTEXT: OnboardingStep = {
  id: "coach-context",
  phase: "Coach Phase · Team Support",
  title: "Set up coach access.",
  body: "Coaches support the athlete’s development, eligibility, recruiting, and leadership growth.",
  fields: [
    { key: "school", label: "School/team", placeholder: "Team or school" },
    { key: "sport", label: "Sport", type: "select", options: ["Basketball", "Football", "Soccer", "Track & Field", "Volleyball", "Baseball", "Softball", "Other"] },
    { key: "coach_role", label: "Coach role", type: "select", options: ["Head coach", "Assistant coach", "Club coach", "Trainer", "Athletic director", "Other"] },
    { key: "athlete_support_focus", label: "Support focus", type: "multi-select", options: ["Eligibility", "Recruiting", "Leadership", "Strength/conditioning", "NIL", "Life after sports"] },
  ],
};

const ORG_CONTEXT = (title: string): OnboardingStep => ({
  id: "organization-context",
  phase: "Organization Phase · Access",
  title,
  body: "Tell us about your organization so access can connect to the correct OS.",
  fields: [
    { key: "organization_name", label: "Organization name", placeholder: "Organization name" },
    { key: "title", label: "Your title", placeholder: "Role/title" },
    { key: "organization_goal", label: "What do you want to do in The Playbook?", type: "textarea", placeholder: "Describe your goals." },
  ],
});


const COMMUNITY_SAFETY_AGREEMENT: OnboardingStep = {
  id: "community-safety",
  phase: "Final Step · Community Safety",
  title: "Agree to the Community Safety Agreement.",
  body: "Before your profile is created, every Playbook member must agree not to participate in bullying, harassment, intimidation, discrimination, threats, cyberbullying, or retaliation in any form.",
  fields: [
    { key: "community_safety_agreed", label: "I have read and agree to The Playbook Community Safety Agreement.", type: "safety-agreement" as any },
  ],
};

const NETWORK: OnboardingStep = {
  id: "network",
  phase: "Final Phase · Support Network",
  title: "Invite your support team.",
  body: "Invite family, mentors, coaches, counselors, or trusted adults before you land in the dashboard.",
  fields: [
    { key: "invite_supporters", label: "Supporter emails", type: "invite-list", placeholder: "supporter@example.com" },
  ],
};

export const ROLE_ONBOARDING: Record<string, OnboardingStep[]> = {
  scholar: [
    IDENTITY("Scholar"),
    SCHOLAR_SUPPORT_DATA,
    SCHOLAR_ACADEMICS,
    SCHOLAR_GOALS,
    SCHOLAR_ACTIVITIES,
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  "scholar-athlete": [
    IDENTITY("Scholar-Athlete"),
    SCHOLAR_SUPPORT_DATA,
    SCHOLAR_ACADEMICS,
    ATHLETE_SPORT_PROFILE,
    ATHLETE_RECRUITING,
    ATHLETE_NIL_TRANSITION,
    SCHOLAR_ACTIVITIES,
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  "transition-youth": [
    IDENTITY("Transition-Aged Youth"),
    SCHOLAR_SUPPORT_DATA,
    SCHOLAR_GOALS,
    SCHOLAR_ACTIVITIES,
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  family: [
    IDENTITY("Family"),
    FAMILY_CONTEXT,
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  mentor: [
    IDENTITY("Mentor"),
    MENTOR_CONTEXT,
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  educator: [
    IDENTITY("Educator"),
    EDUCATOR_CONTEXT,
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  coach: [
    IDENTITY("Coach"),
    COACH_CONTEXT,
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  "college-admin": [
    IDENTITY("College Administrator"),
    ORG_CONTEXT("Set up college administrator access."),
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  district: [
    IDENTITY("District Partner"),
    ORG_CONTEXT("Set up district access."),
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  university: [
    IDENTITY("University Partner"),
    ORG_CONTEXT("Set up university access."),
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  employer: [
    IDENTITY("Employer"),
    ORG_CONTEXT("Set up employer access."),
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],

  other: [
    IDENTITY("Community Partner"),
    ORG_CONTEXT("Tell us why you are joining."),
    NETWORK,
    COMMUNITY_SAFETY_AGREEMENT,
  ],
};

export function getOnboardingSteps(role?: string | null) {
  return ROLE_ONBOARDING[role || "scholar"] || ROLE_ONBOARDING.scholar;
}
