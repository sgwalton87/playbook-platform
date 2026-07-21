import {
  GPA_OPTIONS,
  GRADE_OPTIONS,
  GRADUATION_YEARS,
  MAX_SCHOLAR_PILLARS,
  PLAYBOOK_PILLARS,
} from "@/lib/education";

export type OnboardingField = {
  key: string;
  label: string;
  placeholder?: string;
  type?:
    "text"
    | "date"
    | "textarea"
    | "select"
    | "multi-select"
    | "priority-list"
    | "school"
    | "district"
    | "college"
    | "college-list"
    | "career"
    | "major"
    | "gpa"
    | "graduation-year"
    | "assessment-score"
    | "standardized-test"
    | "activity-list"
    | "invite-list"
    | "starting-five"
    | "safety-agreement";
  options?: string[];

  required?: boolean;
  optional?: boolean;
  helpText?: string;
  maxSelections?: number;
  validation?: "email" | "year" | "gpa" | "assessment-score";
};

export type OnboardingStep = {
  id: string;
  phase: string;
  title: string;
  body: string;
  fields: OnboardingField[];
};

const IDENTITY = (label: string): OnboardingStep => ({
  id: "identity",
  phase: "Phase 1 · Identity",
  title: `Create your ${label} profile.`,
  body: "Your name, handle, photo, and story personalize your Playbook experience.",
  fields: [
    {
      key: "full_name",
      label: "Full name",
      placeholder: "Your name",
      required: true,
    },
    {
      key: "username",
      label: "Username / handle",
      placeholder: "ex: futureleader",
      required: true,
    },
    {
      key: "bio",
      label: "Short bio",
      type: "textarea",
      placeholder:
        "Tell the community who you are becoming.",
    },
    {
      key: "gender",
      label: "Gender",
      type: "select",
      options: [
        "Male",
        "Female",
        "Non-binary",
        "Prefer not to say",
        "Self-describe",
      ],
    },
    {
      key: "date_of_birth",
      label: "Date of birth",
      type: "date",
      required: true,
    },
    {
      key: "city",
      label: "City",
      placeholder: "Oakland",
      required: true,
    },
    {
      key: "zip_code",
      label: "ZIP code",
      placeholder: "94601",
      required: true,
    },
  ],
});

const SCHOLAR_SUPPORT: OnboardingStep = {
  id: "scholar-support",
  phase: "Phase 2 · Support Data",
  title: "Tell us how to support you.",
  body: "This private information helps us understand who we serve and pursue funding. You may skip any question.",
  fields: [
    { key: "race_ethnicity", label: "Race/ethnicity", type: "multi-select", options: ["Black/African American", "Latino/a/e", "Indigenous/Native American", "AAPI", "Pacific Islander", "White", "Multiracial", "Prefer not to say", "Self-describe"] },
    { key: "lgbtqia_affinity", label: "LGBTQIA+ identity or allyship", type: "select", options: ["LGBTQIA+", "Questioning", "Ally", "Prefer not to say"] },
    {
      key: "household_income",
      label: "Household income",
      type: "select",
      options: [
        "Under $25,000",
        "$25,000–$49,999",
        "$50,000–$74,999",
        "$75,000–$99,999",
        "$100,000+",
        "Prefer not to say",
      ],
    },
    { key: "first_generation", label: "First-generation college student?", type: "select", options: ["Yes", "No", "Not sure", "Prefer not to say"] },
    { key: "ell_status", label: "English learner / multilingual learner?", type: "select", options: ["Yes", "No", "Former ELL", "Not sure", "Prefer not to say"] },
    { key: "free_reduced_lunch", label: "Free/reduced lunch eligible?", type: "select", options: ["Yes", "No", "Not sure", "Prefer not to say"] },
    {
      key: "migrant_student",
      label: "Migrant student?",
      type: "select",
      options: ["Yes", "No", "Not sure", "Prefer not to say"],
    },
    { key: "foster_youth", label: "Foster youth / former foster youth?", type: "select", options: ["Yes", "No", "Prefer not to say"] },
    { key: "housing_insecurity", label: "Housing insecurity experience?", type: "select", options: ["Yes", "No", "Prefer not to say"] },
    {
      key: "has_iep",
      label: "IEP or 504 plan?",
      type: "select",
      options: ["Yes", "No", "Not sure", "Prefer not to say"],
    },
  ],
};

const SCHOLAR_ACADEMIC: OnboardingStep = {
  id: "scholar-academic",
  phase: "Phase 3 · Academic Baseline",
  title: "Map your academic path.",
  body: "This powers A-G readiness, college matching, internships, scholarships, and your Scholar Record.",
  fields: [
    {
      key: "school",
      label: "Current high school / institution",
      type: "school",
      placeholder: "Start typing your school...",
      required: true,
      helpText: "Choose your school or type it if it is not listed.",
    },
    {
      key: "school_district",
      label: "California school district",
      type: "district",
      placeholder: "Start typing your district...",
      required: true,
    },
    {
      key: "grade",
      label: "Current grade or education stage",
      type: "select",
      options: [...GRADE_OPTIONS],
      required: true,
    },
    {
      key: "gpa",
      label: "Current cumulative GPA",
      type: "gpa",
      options: [...GPA_OPTIONS],
      required: true,
      validation: "gpa",
      helpText: "Choose your weighted or unweighted cumulative GPA.",
    },
    {
      key: "graduation_year",
      label: "Expected graduation year",
      type: "graduation-year",
      options: [...GRADUATION_YEARS],
      required: true,
      validation: "year",
    },
    {
      key: "ela_score",
      label: "Latest ELA assessment score",
      type: "assessment-score",
      placeholder: "Optional",
      optional: true,
      validation: "assessment-score",
    },
    {
      key: "math_score",
      label: "Latest Math assessment score",
      type: "assessment-score",
      placeholder: "Optional",
      optional: true,
      validation: "assessment-score",
    },
    {
      key: "dream_school",
      label: "Dream school",
      type: "college",
      placeholder: "Start typing any college...",
      required: true,
    },
    {
      key: "top_schools",
      label: "Top college choices",
      type: "college-list",
      placeholder: "Start typing any college...",
      required: true,
      helpText: "Add up to 10 schools. You must add at least one.",
    },
  ],
};

const SCHOLAR_GOALS: OnboardingStep = {
  id: "scholar-goals",
  phase: "Phase 4 · Future Vision",
  title: "Name your future.",
  body: "Tell us what future you are building so Compass can guide your next moves.",
  fields: [
    {
      key: "intended_major",
      label: "Intended college major(s)",
      type: "major",
      placeholder: "Start typing a college major...",
      required: true,
    },
    {
      key: "ideal_profession",
      label: "Career interest",
      type: "career",
      placeholder: "Start typing a career...",
    },
    {
      key: "sat_testing",
      label: "SAT testing plan",
      type: "standardized-test",
      optional: true,
      helpText:
        "Record completed SAT attempts, future test dates, or why you are skipping it for now.",
    },
    {
      key: "act_testing",
      label: "ACT testing plan",
      type: "standardized-test",
      optional: true,
      helpText:
        "Record completed ACT attempts, future test dates, or why you are skipping it for now.",
    },
    {
      key: "engagement_preferences",
      label: "What help do you want first?",
      type: "priority-list",
      required: true,
      helpText:
        "Rank the support you want. Your first choice becomes your highest priority for Compass and mentor matching.",
      options: [
        "Essay Help",
        "College Matching",
        "Scholarship Tracking",
        "Internships",
        "Mentorship",
        "Transcript Review",
      ],
    },
  ],
};

const SCHOLAR_ACTIVITIES: OnboardingStep = {
  id: "scholar-activities",
  phase: "Phase 5 · Activities",
  title: "Show the full story.",
  body: "Activities, jobs, leadership, service, family responsibilities, and creativity belong in your Scholar Record.",
  fields: [
    {
      key: "activities",
      label: "Activity entries",
      type: "activity-list",
      optional: true,
      helpText:
        "Choose a category first, then add the specific activity, your role, organization, weekly hours, total hours, supervisor, and what you learned.",
    },
  ],
};


const SCHOLAR_PILLARS: OnboardingStep = {
  id: "scholar-pillars",
  phase: "Phase 6 · Pillars",
  title: "Choose what drives you.",
  body:
    "Select and rank the five areas that matter most to your goals, identity, and future opportunities.",
  fields: [
    {
      key: "pillars",
      label: "Your Top 5 Playbook Pillars",
      type: "priority-list",
      required: true,
      maxSelections: MAX_SCHOLAR_PILLARS,
      helpText:
        "Choose up to five Pillars and rank them. Number 1 should be the area that matters most to you right now.",
      options: [...PLAYBOOK_PILLARS],
    },
  ],
};

const ATHLETE_PROFILE: OnboardingStep = {
  id: "athlete-profile",
  phase: "Athlete Phase 1 · Athletic Profile",
  title: "Build your athlete card.",
  body: "Your athletic profile should tell coaches, mentors, and supporters what you play and where you are headed.",
  fields: [
    { key: "primary_sport", label: "Primary sport", type: "select", options: ["Basketball", "Football", "Soccer", "Track & Field", "Volleyball", "Baseball", "Softball", "Cheer", "Dance", "Swimming", "Tennis", "Golf", "Wrestling", "Other"] },
    { key: "secondary_sport", label: "Secondary sport", type: "select", options: ["None", "Basketball", "Football", "Soccer", "Track & Field", "Volleyball", "Baseball", "Softball", "Cheer", "Dance", "Swimming", "Tennis", "Golf", "Wrestling", "Other"] },
    { key: "position", label: "Position / event", placeholder: "Guard, forward, sprinter, libero..." },
    { key: "current_team", label: "Current team / club", placeholder: "School, AAU, club, travel team..." },
    { key: "height_weight", label: "Height / weight if applicable", placeholder: "ex: 5'11 / 150" },
    { key: "key_stats_honors", label: "Key stats / honors", type: "textarea", placeholder: "Awards, stats, honors, captain roles..." },
  ],
};

const ATHLETE_RECRUITING: OnboardingStep = {
  id: "athlete-recruiting",
  phase: "Athlete Phase 2 · Recruiting Goals",
  title: "Track recruiting readiness.",
  body: "This powers the Scholar-Athlete OS for eligibility, recruiting, NIL, and life after sports.",
  fields: [
    { key: "target_division", label: "Target level", type: "select", options: ["NCAA D1", "NCAA D2", "NCAA D3", "NAIA", "JUCO", "Club", "Undecided"] },
    {
      key: "target_major",
      label: "Target major",
      type: "major",
      placeholder: "Start typing a college major...",
    },
    {
      key: "highlight_video_status",
      label: "Highlight video?",
      type: "select",
      options: ["Yes", "No", "Working on it"],
    },
    { key: "highlight_link", label: "Highlight/video link", placeholder: "Hudl, YouTube, Instagram, MaxPreps..." },
    { key: "eligibility_support_needed", label: "Eligibility support needed?", type: "multi-select", options: ["GPA", "A-G requirements", "NCAA/NAIA eligibility", "SAT/ACT", "Financial aid", "Transfer pathway", "Not sure"] },
    { key: "nil_interest", label: "NIL / brand interest", type: "multi-select", options: ["Personal brand", "Social media", "Local business partnerships", "Merch", "Financial literacy", "Not sure yet"] },
  ],
};

const BRAND_CONTEXT: OnboardingStep = {
  id: "brand-context",
  phase: "Brand Phase 1 · Partnership Profile",
  title: "Build your brand partner profile.",
  body: "Brand partners help power NIL education, sponsorships, campaigns, rewards, internships, and real opportunity.",
  fields: [
    { key: "organization_name", label: "Brand / organization name", placeholder: "Company, nonprofit, foundation, local business..." },
    { key: "title", label: "Your role/title", placeholder: "Founder, marketing director, community lead..." },
    { key: "brand_category", label: "Brand category", type: "select", options: ["Local business", "Corporate brand", "Nonprofit", "Foundation", "Sports organization", "Education partner", "Financial services", "Health/wellness", "Apparel/merch", "Media/creative", "Other"] },
    { key: "partnership_goals", label: "Partnership goals", type: "multi-select", options: ["Sponsor scholars", "Sponsor scholar-athletes", "Offer rewards", "Create NIL education", "Run campaigns", "Offer internships", "Host events", "Fund courses", "Support scholarships"] },
    { key: "target_audience", label: "Who do you want to reach/support?", type: "multi-select", options: ["Scholars", "Scholar-athletes", "Transition-age youth", "Families", "Educators", "Coaches", "Oakland/Bay Area youth", "California students", "National audience"] },
    { key: "monthly_budget_range", label: "Estimated monthly partnership budget", type: "select", options: ["Under $500", "$500–$1,500", "$1,500–$5,000", "$5,000–$10,000", "$10,000+", "Not sure yet"] },
  ],
};

const BRAND_COMPLIANCE: OnboardingStep = {
  id: "brand-compliance",
  phase: "Brand Phase 2 · Compliance",
  title: "Set partnership guardrails.",
  body: "Because brand partners may interact with scholar-athletes, we need clear NIL and safety expectations.",
  fields: [
    { key: "nil_acknowledgement", label: "NIL / compliance acknowledgement", type: "select", options: ["I understand athlete campaigns may require compliance review", "I only want non-athlete scholar campaigns for now", "I need help understanding NIL compliance"] },
    { key: "campaign_types", label: "Campaign types of interest", type: "multi-select", options: ["Rewards", "Scholarships", "Events", "Internships", "Social campaigns", "Merch", "Financial education", "Health/wellness"] },
    { key: "approval_contact", label: "Compliance / approval contact", placeholder: "Name and email for campaign approvals" },
  ],
};


const FAMILY_CONTEXT: OnboardingStep = {
  id: "family-context",
  phase: "Family Phase 1 · Scholar Support",
  title: "Connect to the scholar you support.",
  body: "Parents and guardians can monitor, pay, support, and help their scholar stay on track without taking ownership away from the scholar.",
  fields: [
    { key: "relationship_to_scholar", label: "Relationship to scholar", type: "select", options: ["Parent", "Guardian", "Grandparent", "Aunt/Uncle", "Sibling", "Caregiver", "Other"] },
    { key: "child_invite_code", label: "Child invite code", placeholder: "Enter invite code if your scholar gave you one" },
    { key: "dependent_name", label: "Dependent / scholar name", placeholder: "Scholar name" },
    { key: "dependent_email", label: "Dependent / scholar email", placeholder: "scholar@example.com" },
    { key: "household_scholars", label: "Number of scholars/athletes in household", type: "select", options: ["1", "2", "3", "4+", "Prefer not to say"] },
    { key: "preferred_contact_method", label: "Preferred communication method", type: "select", options: ["Email", "SMS", "Phone", "In-app messages"] },
    { key: "family_focus", label: "Primary support focus", type: "multi-select", options: ["Academic monitoring", "Athletic recruiting", "Financial aid/scholarships", "College matching", "Mental wellness", "Transportation/logistics", "Mentorship"] },
  ],
};

const MENTOR_CONTEXT: OnboardingStep = {
  id: "mentor-context",
  phase: "Mentor Phase 1 · Guidance Profile",
  title: "Create your mentor profile.",
  body: "Mentors help scholars move through goals, applications, career choices, confidence, and life transitions.",
  fields: [
    { key: "organization_name", label: "Organization/company", placeholder: "Where are you connected?" },
    { key: "mentor_title", label: "Role/title", placeholder: "Advisor, founder, counselor, professional..." },
    { key: "expertise", label: "Areas of expertise", type: "multi-select", options: ["College applications", "Career coaching", "Financial literacy", "Entrepreneurship", "Athletics", "STEM", "Arts/media", "Mental wellness", "Trades", "Civic leadership"] },
    { key: "age_groups_supported", label: "Age groups you can support", type: "multi-select", options: ["Middle school", "High school", "College", "Transition-age youth", "Young adults"] },
    { key: "availability", label: "Availability", type: "select", options: ["Weekly", "Biweekly", "Monthly", "Events only", "As needed", "Not sure yet"] },
    { key: "mentoring_format", label: "Preferred mentoring format", type: "multi-select", options: ["Virtual", "In person", "Group sessions", "1:1 sessions", "Workshops", "Application review"] },
    { key: "open_to_recommendations", label: "Open to recommendation/support requests?", type: "select", options: ["Yes", "No", "Case by case"] },
  ],
};

const EDUCATOR_CONTEXT: OnboardingStep = {
  id: "educator-context",
  phase: "Educator Phase 1 · Verification",
  title: "Set up educator access.",
  body: "Educators provide character references, recommendation letters, academic support, and student progress insight.",
  fields: [
    { key: "school", label: "School name", placeholder: "School or organization" },
    { key: "school_district", label: "District", type: "district", placeholder: "Start typing district..." },
    { key: "subjects_taught", label: "Subject(s) taught", type: "multi-select", options: ["English", "Math", "Science", "History/Social Science", "World Language", "Visual/Performing Arts", "PE/Athletics", "College/Career", "Special Education", "Other"] },
    { key: "official_edu_email", label: "Official school email", placeholder: "name@school.edu or district email" },
    { key: "existing_students_to_support", label: "Do you already have students you want to support?", type: "select", options: ["Yes", "No", "Not yet"] },
    { key: "student_search_names", label: "Student names to search/connect", type: "textarea", placeholder: "List students you want to support, one per line." },
    { key: "open_to_letters", label: "Open to receiving letter of recommendation requests?", type: "select", options: ["Yes", "No", "Case by case"] },
    { key: "educator_support_focus", label: "Support focus", type: "multi-select", options: ["Letters of recommendation", "Character references", "A-G readiness", "College applications", "FAFSA/CADAA", "Transcript progress", "Internships", "Mentorship"] },
  ],
};


const HIGH_SCHOOL_COACH_CONTEXT: OnboardingStep = {
  id: "high-school-coach-context",
  phase: "Coach Phase 1 · School Verification",
  title: "Verify your coaching profile.",
  body: "Tell us where you coach so we can connect your roster, school, athletes, and recruiting support tools.",
  fields: [
    {
      key: "school",
      label: "High school name",
      placeholder: "Start typing your school..."
    },
    {
      key: "school_city",
      label: "School city",
      placeholder: "City"
    },
    {
      key: "school_state",
      label: "State",
      type: "select",
      options: [
        "California", "Alabama", "Alaska", "Arizona", "Arkansas",
        "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
        "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
        "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
        "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana",
        "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
        "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma",
        "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
        "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
      ]
    },
    {
      key: "official_school_email",
      label: "Official school email",
      placeholder: "coach@school.edu or district email"
    }
  ],
};

const HIGH_SCHOOL_COACH_DETAILS: OnboardingStep = {
  id: "high-school-coach-details",
  phase: "Coach Phase 2 · Coaching Details",
  title: "Tell us about your team.",
  body: "Your coaching profile helps athletes connect their development, academics, recruiting, and recommendations.",
  fields: [
    {
      key: "primary_sport",
      label: "Primary sport coached",
      type: "select",
      options: [
        "Basketball", "Football", "Soccer", "Track & Field",
        "Volleyball", "Baseball", "Softball", "Cheer", "Dance",
        "Swimming", "Tennis", "Golf", "Wrestling",
        "Cross Country", "Lacrosse", "Water Polo", "Other"
      ]
    },
    {
      key: "coach_role",
      label: "Coaching role",
      type: "select",
      options: [
        "Head Coach",
        "Assistant Coach",
        "Position Coach",
        "Strength & Conditioning Coach",
        "Athletic Director",
        "Other"
      ]
    },
    {
      key: "years_coaching",
      label: "Years of coaching experience",
      type: "select",
      options: ["Less than 1 year", "1–3 years", "4–7 years", "8–15 years", "16+ years"]
    },
    {
      key: "roster_size",
      label: "Approximate roster size",
      type: "select",
      options: ["1–10", "11–20", "21–40", "41–75", "76+"]
    }
  ],
};

const HIGH_SCHOOL_COACH_INTENT: OnboardingStep = {
  id: "high-school-coach-intent",
  phase: "Coach Phase 3 · Athlete Advocacy",
  title: "How do you want to support your athletes?",
  body: "Choose the tools you want The Playbook to help you use.",
  fields: [
    {
      key: "upload_game_film",
      label: "Do you plan to upload game film?",
      type: "select",
      options: ["Yes", "No", "Maybe later"]
    },
    {
      key: "send_player_recommendations",
      label: "Do you want to send player recommendations to college coaches?",
      type: "select",
      options: ["Yes", "No", "Maybe later"]
    },
    {
      key: "coach_support_focus",
      label: "Athlete support priorities",
      type: "multi-select",
      options: [
        "Academic eligibility",
        "A-G progress",
        "NCAA eligibility",
        "Recruiting exposure",
        "Film review",
        "College coach introductions",
        "Leadership development",
        "NIL education",
        "Life after sports"
      ]
    }
  ],
};

const COLLEGE_COACH_VERIFICATION: OnboardingStep = {
  id: "college-coach-verification",
  phase: "Recruiting Phase 1 · Institution Verification",
  title: "Verify your recruiting profile.",
  body: "College coaches and recruiters receive specialized talent discovery access after institutional verification.",
  fields: [
    {
      key: "college_name",
      label: "College / university name",
      type: "college",
      placeholder: "Start typing your institution..."
    },
    {
      key: "conference",
      label: "Conference",
      placeholder: "ACC, Big Ten, Big 12, CCAA..."
    },
    {
      key: "division_level",
      label: "Division level",
      type: "select",
      options: [
        "NCAA Division I",
        "NCAA Division II",
        "NCAA Division III",
        "NAIA",
        "NJCAA / JUCO",
        "CCCAA",
        "USCAA",
        "NCCAA",
        "Other"
      ]
    },
    {
      key: "official_edu_email",
      label: "Official institutional email",
      placeholder: "coach@university.edu"
    }
  ],
};

const COLLEGE_COACH_SCOPE: OnboardingStep = {
  id: "college-coach-scope",
  phase: "Recruiting Phase 2 · Recruiting Scope",
  title: "Define the talent you recruit.",
  body: "These preferences will eventually power athlete discovery and intelligent matching.",
  fields: [
    {
      key: "primary_sport_recruiting",
      label: "Primary sport recruiting for",
      type: "select",
      options: [
        "Basketball", "Football", "Soccer", "Track & Field",
        "Volleyball", "Baseball", "Softball", "Swimming",
        "Tennis", "Golf", "Wrestling", "Cross Country",
        "Lacrosse", "Water Polo", "Other"
      ]
    },
    {
      key: "positions_recruiting",
      label: "Positions / events you are recruiting",
      placeholder: "Point guard, quarterback, 100m, libero..."
    },
    {
      key: "recruiting_radius",
      label: "Geographic recruiting radius",
      type: "multi-select",
      options: ["Local", "Regional", "Statewide", "National", "International"]
    },
    {
      key: "graduation_classes_recruiting",
      label: "Graduation classes currently recruiting",
      type: "multi-select",
      options: ["2026", "2027", "2028", "2029", "2030+"]
    }
  ],
};

const COLLEGE_COACH_CONTACT: OnboardingStep = {
  id: "college-coach-contact",
  phase: "Recruiting Phase 3 · Contact & Compliance",
  title: "Set your communication preferences.",
  body: "Recruiting communication must respect institutional policy and applicable collegiate athletics rules.",
  fields: [
    {
      key: "direct_phone",
      label: "Direct phone number (optional)",
      placeholder: "Optional"
    },
    {
      key: "preferred_recruiting_contact",
      label: "Preferred initial contact method",
      type: "select",
      options: [
        "Platform message",
        "Institutional email",
        "Phone",
        "Through high school coach",
        "Through counselor"
      ]
    },
    {
      key: "ncaa_id_status",
      label: "NCAA / institutional verification status",
      type: "select",
      options: [
        "I have institutional recruiting authorization",
        "Verification pending",
        "Not applicable to my institution",
        "I need assistance"
      ]
    }
  ],
};

const ADMISSIONS_VERIFICATION: OnboardingStep = {
  id: "admissions-verification",
  phase: "Admissions Phase 1 · Institution Details",
  title: "Verify your admissions profile.",
  body: "Admissions professionals can discover academic talent and help students understand institutional opportunities.",
  fields: [
    {
      key: "college_name",
      label: "College / university name",
      type: "college",
      placeholder: "Start typing your institution..."
    },
    {
      key: "department",
      label: "Department",
      type: "select",
      options: [
        "Undergraduate Admissions",
        "Graduate Admissions",
        "Enrollment Management",
        "Financial Aid",
        "Student Success",
        "TRIO / Access Programs",
        "Athletics Admissions",
        "Other"
      ]
    },
    {
      key: "admissions_region",
      label: "Admissions territory / region",
      placeholder: "Northern California, Bay Area, National..."
    },
    {
      key: "official_edu_email",
      label: "Official .edu email",
      placeholder: "name@university.edu"
    }
  ],
};

const ADMISSIONS_CRITERIA: OnboardingStep = {
  id: "admissions-criteria",
  phase: "Admissions Phase 2 · Search Criteria",
  title: "What academic talent are you looking for?",
  body: "Your criteria will help improve student-to-institution matching.",
  fields: [
    {
      key: "minimum_gpa_threshold",
      label: "Minimum GPA threshold you typically consider",
      type: "select",
      options: [
        "No minimum / holistic review",
        "2.0+",
        "2.5+",
        "3.0+",
        "3.5+",
        "3.75+",
        "4.0 weighted or above"
      ]
    },
    {
      key: "target_majors",
      label: "Target majors / academic programs",
      type: "multi-select",
      options: [
        "Business",
        "STEM",
        "Computer Science",
        "Engineering",
        "Health Sciences",
        "Pre-Med",
        "Education",
        "Social Sciences",
        "Arts & Media",
        "Public Policy",
        "Communications",
        "Undecided / Exploratory"
      ]
    },
    {
      key: "student_populations",
      label: "Student populations your programs actively support",
      type: "multi-select",
      options: [
        "First-generation students",
        "Low-income students",
        "Student-athletes",
        "Transfer students",
        "Foster youth",
        "Multilingual learners",
        "Rural students",
        "Urban students",
        "International students",
        "All students"
      ]
    }
  ],
};

const ADMISSIONS_ENGAGEMENT: OnboardingStep = {
  id: "admissions-engagement",
  phase: "Admissions Phase 3 · Engagement",
  title: "How should scholars connect with you?",
  body: "Set clear boundaries for student communication and institutional engagement.",
  fields: [
    {
      key: "student_contact_preference",
      label: "How may students contact you?",
      type: "select",
      options: [
        "Direct platform messages",
        "Institutional email only",
        "Application portal only",
        "Scheduled events only",
        "No direct student contact"
      ]
    },
    {
      key: "engagement_opportunities",
      label: "Opportunities you want to share",
      type: "multi-select",
      options: [
        "Campus visits",
        "Virtual information sessions",
        "Application workshops",
        "Financial aid workshops",
        "Fly-in programs",
        "Summer programs",
        "Scholarships",
        "Internships / research",
        "Transfer pathways"
      ]
    }
  ],
};

const NETWORK: OnboardingStep = {
  id: "starting-5",
  phase: "Starting 5",
  title: "Build Your Starting 5",
  body: "Every scholar deserves a strong support team. Add at least one parent, guardian, or trusted adult now. You'll finish building your Starting 5 after onboarding.",
  fields: [
    {
      key: "starting5_parent",
      label: "Parent / Guardian Email",
      type: "starting-five",
      placeholder: "parent@example.com",
      required: true,
      helpText: "Only the first email is required during onboarding.",
    },
  ],
};

const USER_AGREEMENT: OnboardingStep = {
  id: "community-safety",
  phase: "Final Step · User Agreement",
  title: "Review and agree before your profile is created.",
  body: "This agreement covers community safety, minors, student data, NCAA-related expectations, privacy, and platform terms.",
  fields: [
    { key: "community_safety_agreed", label: "I have read and agree to The Playbook User Agreement.", type: "safety-agreement" },
  ],
};

export const ROLE_ONBOARDING: Record<string, OnboardingStep[]> = {
  scholar: [
    IDENTITY("Scholar"),
    SCHOLAR_SUPPORT,
    SCHOLAR_ACADEMIC,
    SCHOLAR_GOALS,
    SCHOLAR_ACTIVITIES,
    SCHOLAR_PILLARS,
    NETWORK,
    USER_AGREEMENT,
  ],

  "scholar-athlete": [
    IDENTITY("Scholar-Athlete"),
    SCHOLAR_SUPPORT,
    SCHOLAR_ACADEMIC,
    ATHLETE_PROFILE,
    ATHLETE_RECRUITING,
    SCHOLAR_ACTIVITIES,
    SCHOLAR_PILLARS,
    NETWORK,
    USER_AGREEMENT,
  ],

  "brand-partner": [
    IDENTITY("Brand Partner"),
    BRAND_CONTEXT,
    BRAND_COMPLIANCE,
    NETWORK,
    USER_AGREEMENT,
  ],

  family: [
    IDENTITY("Parent / Guardian"),
    FAMILY_CONTEXT,
    NETWORK,
    USER_AGREEMENT,
  ],

  mentor: [
    IDENTITY("Mentor"),
    MENTOR_CONTEXT,
    NETWORK,
    USER_AGREEMENT,
  ],

  educator: [
    IDENTITY("Teacher / Educator"),
    EDUCATOR_CONTEXT,
    NETWORK,
    USER_AGREEMENT,
  ],
  coach: [
    IDENTITY("High School Coach"),
    HIGH_SCHOOL_COACH_CONTEXT,
    HIGH_SCHOOL_COACH_DETAILS,
    HIGH_SCHOOL_COACH_INTENT,
    NETWORK,
    USER_AGREEMENT,
  ],

  "college-coach": [
    IDENTITY("College Coach / Recruiter"),
    COLLEGE_COACH_VERIFICATION,
    COLLEGE_COACH_SCOPE,
    COLLEGE_COACH_CONTACT,
    NETWORK,
    USER_AGREEMENT,
  ],

  "college-admissions": [
    IDENTITY("College Admissions Officer"),
    ADMISSIONS_VERIFICATION,
    ADMISSIONS_CRITERIA,
    ADMISSIONS_ENGAGEMENT,
    NETWORK,
    USER_AGREEMENT,
  ],
  "transition-youth": [
    IDENTITY("Transition-Aged Youth"),
    SCHOLAR_SUPPORT,
    SCHOLAR_ACADEMIC,
    SCHOLAR_GOALS,
    ATHLETE_PROFILE,
    SCHOLAR_ACTIVITIES,
    SCHOLAR_PILLARS,
    NETWORK,
    USER_AGREEMENT,
  ],
  other: [IDENTITY("Community Partner"), NETWORK, USER_AGREEMENT],
};

export function getOnboardingSteps(role?: string | null) {
  return ROLE_ONBOARDING[role || "scholar"] || ROLE_ONBOARDING.scholar;
}
