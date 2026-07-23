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
    | "invite-list"
    | "support-network"
    | "safety-agreement";
  options?: string[];
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
    { key: "full_name", label: "Full name", placeholder: "Your name" },
    { key: "username", label: "Username / handle", placeholder: "ex: futureleader" },
    { key: "bio", label: "Short bio", type: "textarea", placeholder: "Tell the community who you are becoming." },
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
    { key: "first_generation", label: "First-generation college student?", type: "select", options: ["Yes", "No", "Not sure", "Prefer not to say"] },
    { key: "ell_status", label: "English learner / multilingual learner?", type: "select", options: ["Yes", "No", "Former ELL", "Not sure", "Prefer not to say"] },
    { key: "free_reduced_lunch", label: "Free/reduced lunch eligible?", type: "select", options: ["Yes", "No", "Not sure", "Prefer not to say"] },
    { key: "foster_youth", label: "Foster youth / former foster youth?", type: "select", options: ["Yes", "No", "Prefer not to say"] },
    { key: "housing_insecurity", label: "Housing insecurity experience?", type: "select", options: ["Yes", "No", "Prefer not to say"] },
  ],
};

const SCHOLAR_ACADEMIC: OnboardingStep = {
  id: "scholar-academic",
  phase: "Phase 3 · Academic Baseline",
  title: "Map your academic path.",
  body: "This powers A-G readiness, college matching, internships, and your Scholar Record.",
  fields: [
    { key: "school", label: "Current high school / institution", placeholder: "School name" },
    { key: "school_district", label: "California school district", type: "district", placeholder: "Start typing your district..." },
    { key: "grade", label: "Grade", type: "select", options: ["8", "9", "10", "11", "12", "College", "Transition-age youth", "Other"] },
    { key: "gpa", label: "Current GPA", placeholder: "ex: 3.4" },
    { key: "graduation_year", label: "Graduation year", placeholder: "ex: 2027" },
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
    { key: "intended_major", label: "Intended college major(s)", placeholder: "Business, biology, computer science..." },
    { key: "ideal_profession", label: "Career interest", type: "career", placeholder: "Start typing a career..." },
    { key: "sat_act_status", label: "SAT/ACT status", type: "select", options: ["Taken", "Planning", "Skipping", "Not sure"] },
    { key: "engagement_preferences", label: "What help do you want first?", type: "multi-select", options: ["Essay Help", "College Matching", "Scholarship Tracking", "Internships", "Mentorship", "Transcript Review"] },
  ],
};

const SCHOLAR_ACTIVITIES: OnboardingStep = {
  id: "scholar-activities",
  phase: "Phase 5 · Activities",
  title: "Show the full story.",
  body: "Activities, jobs, leadership, service, family responsibilities, and creativity belong in your Scholar Record.",
  fields: [
    { key: "activities", label: "Activity entries", type: "activity-list", placeholder: "Add activity details..." },
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
    { key: "target_major", label: "Target major", placeholder: "Kinesiology, business, biology..." },
    { key: "highlight_video_status", label: "Highlight video?", type: "select", options: ["Yes", "No", "Working on it"] },
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

const COUNSELOR_VERIFICATION: OnboardingStep = {
  id: "counselor-verification",
  phase: "Counselor Phase 1 · Institution Verification",
  title: "Verify your counselor profile.",
  body: "Connect your official school identity before accessing student planning and support workflows.",
  fields: [
    { key: "school", label: "High school / institution", placeholder: "School name" },
    { key: "school_district", label: "District", type: "district", placeholder: "Start typing your district..." },
    { key: "official_school_email", label: "Official school email", placeholder: "counselor@school.edu" },
    { key: "counselor_title", label: "Title / role", type: "select", options: ["School Counselor", "College Counselor", "College & Career Advisor", "Academic Counselor", "Student Support Counselor", "Department Lead", "Other"] },
  ],
};

const COUNSELOR_CASELOAD: OnboardingStep = {
  id: "counselor-caseload",
  phase: "Counselor Phase 2 · Caseload & Programs",
  title: "Define the students and programs you support.",
  body: "Caseload context shapes permissions, readiness views, interventions, and outreach.",
  fields: [
    { key: "grade_levels_served", label: "Grade levels served", type: "multi-select", options: ["8", "9", "10", "11", "12", "Transition-age youth", "Graduates / alumni"] },
    { key: "approximate_caseload", label: "Approximate caseload", type: "select", options: ["1–50", "51–150", "151–300", "301–500", "500+"] },
    { key: "programs_supported", label: "Programs supported", type: "multi-select", options: ["A-G planning", "College applications", "FAFSA / CADAA", "Scholarships", "Dual enrollment", "Career technical education", "Transfer pathways", "Foster youth", "McKinney-Vento", "Special education", "Athletic eligibility"] },
  ],
};

const COUNSELOR_SUPPORT: OnboardingStep = {
  id: "counselor-support",
  phase: "Counselor Phase 3 · Workflow Preferences",
  title: "Choose your counselor workflows.",
  body: "Tell Playbook which student milestones and requests should reach you first.",
  fields: [
    { key: "counselor_workflows", label: "Priority workflows", type: "multi-select", options: ["Transcript review", "Graduation readiness", "College list review", "Application deadlines", "Financial aid completion", "Recommendation coordination", "Crisis / support referral", "Family outreach", "Athletic eligibility"] },
    { key: "student_connection_method", label: "How should students connect?", type: "select", options: ["Invitation / roster only", "School email match", "Student request with approval", "Administrator-assigned caseload"] },
  ],
};

const EMPLOYER_VERIFICATION: OnboardingStep = {
  id: "employer-verification",
  phase: "Employer Phase 1 · Organization Verification",
  title: "Verify your workforce organization.",
  body: "Verified organizations can publish responsible, age-appropriate career opportunities.",
  fields: [
    { key: "organization_name", label: "Organization name", placeholder: "Company, agency, nonprofit..." },
    { key: "organization_website", label: "Organization website", placeholder: "https://..." },
    { key: "employer_title", label: "Your title", placeholder: "Hiring manager, program director..." },
    { key: "official_work_email", label: "Official work email", placeholder: "name@organization.org" },
    { key: "organization_size", label: "Organization size", type: "select", options: ["1–10", "11–50", "51–250", "251–1,000", "1,000+"] },
  ],
};

const EMPLOYER_OPPORTUNITIES: OnboardingStep = {
  id: "employer-opportunities",
  phase: "Employer Phase 2 · Opportunity Design",
  title: "Define the opportunities you plan to offer.",
  body: "Opportunity details power responsible matching, eligibility, and student preparation.",
  fields: [
    { key: "opportunity_types", label: "Opportunity types", type: "multi-select", options: ["Career exploration", "Job shadow", "Internship", "Paid internship", "Apprenticeship", "Part-time job", "Full-time entry role", "Mentorship", "Workshop", "Site visit"] },
    { key: "career_sectors", label: "Career sectors", type: "multi-select", options: ["Technology", "Healthcare", "Business", "Education", "Public service", "Skilled trades", "Sports", "Media / creative", "Hospitality", "Green economy", "Other"] },
    { key: "participant_age_groups", label: "Eligible age groups", type: "multi-select", options: ["14–15", "16–17", "18+", "College students", "Transition-age youth"] },
    { key: "opportunity_geography", label: "Opportunity geography", type: "select", options: ["Remote", "Local / in person", "Regional", "Statewide", "National"] },
    { key: "compensation_commitment", label: "Compensation approach", type: "select", options: ["All opportunities paid", "Mix of paid and unpaid learning", "Stipends", "Academic credit", "Still determining"] },
  ],
};

const EMPLOYER_SAFEGUARDS: OnboardingStep = {
  id: "employer-safeguards",
  phase: "Employer Phase 3 · Youth Safety & Contact",
  title: "Set opportunity safeguards.",
  body: "Clear supervision and contact boundaries protect young people and partner organizations.",
  fields: [
    { key: "background_check_readiness", label: "Youth-serving staff readiness", type: "select", options: ["Required checks complete", "Checks in progress", "Only serving adults 18+", "Need guidance"] },
    { key: "student_contact_boundary", label: "Student contact preference", type: "select", options: ["Platform messages only", "Through school staff", "Through parent / guardian", "Official work email after approval"] },
    { key: "opportunity_approval_contact", label: "Opportunity approval contact", placeholder: "Name and official email" },
  ],
};

const DISTRICT_VERIFICATION: OnboardingStep = {
  id: "district-verification",
  phase: "District Phase 1 · Authority Verification",
  title: "Verify your institution and authority.",
  body: "Administrative access is provisioned only after organization and authority verification.",
  fields: [
    { key: "organization_name", label: "District / school organization", placeholder: "Organization name" },
    { key: "school_district", label: "District", type: "district", placeholder: "Start typing district..." },
    { key: "administrator_title", label: "Administrative role", type: "select", options: ["District Administrator", "Superintendent", "Principal", "Assistant Principal", "Program Director", "IT / Data Administrator", "College & Career Lead", "Athletic Director", "Other"] },
    { key: "official_school_email", label: "Official organization email", placeholder: "name@district.org" },
  ],
};

const DISTRICT_IMPLEMENTATION: OnboardingStep = {
  id: "district-implementation",
  phase: "District Phase 2 · Implementation Scope",
  title: "Plan your Playbook implementation.",
  body: "Define the schools, users, programs, and outcomes included in your rollout.",
  fields: [
    { key: "implementation_scope", label: "Implementation scope", type: "select", options: ["Single school", "Multiple schools", "Districtwide", "Program / cohort", "Pilot"] },
    { key: "schools_in_scope", label: "Schools / programs in scope", type: "textarea", placeholder: "List schools or programs" },
    { key: "estimated_student_count", label: "Estimated students", type: "select", options: ["1–100", "101–500", "501–2,000", "2,001–10,000", "10,000+"] },
    { key: "implementation_goals", label: "Implementation goals", type: "multi-select", options: ["Graduation readiness", "College access", "Financial aid", "Career pathways", "Athletic eligibility", "Mentorship", "Family engagement", "Opportunity access", "Transition-age youth support"] },
  ],
};

const DISTRICT_GOVERNANCE: OnboardingStep = {
  id: "district-governance",
  phase: "District Phase 3 · Data & Permissions",
  title: "Set governance and permission boundaries.",
  body: "Playbook access follows least-privilege rules, student consent, and institutional agreements.",
  fields: [
    { key: "roster_method", label: "Preferred roster method", type: "select", options: ["Secure CSV", "SIS integration", "Invitation codes", "Manual pilot roster", "Not decided"] },
    { key: "data_agreement_status", label: "Data agreement status", type: "select", options: ["Ready for review", "Legal / privacy review required", "Existing agreement", "Pilot without roster integration"] },
    { key: "permission_owners", label: "Permission / data owners", type: "textarea", placeholder: "Names, titles, and official emails" },
  ],
};

const ATHLETE_ABROAD_ENROLLMENT: OnboardingStep = {
  id: "athlete-abroad-enrollment",
  phase: "Abroad Phase 1 · International Goals",
  title: "Map your athlete-abroad pathway.",
  body: "Connect education, sport, travel, eligibility, and support into one international plan.",
  fields: [
    { key: "target_countries", label: "Countries / regions of interest", type: "multi-select", options: ["United Kingdom", "Spain", "France", "Germany", "Italy", "Portugal", "Australia", "Canada", "Latin America", "Asia", "Africa", "Open to options"] },
    { key: "abroad_pathway_goal", label: "Primary goal", type: "select", options: ["University + sport", "Academy / club", "Gap-year development", "Professional pathway", "Exchange program", "Training / competition", "Still exploring"] },
    { key: "desired_start_window", label: "Desired start window", placeholder: "Season and year" },
    { key: "languages_spoken", label: "Languages spoken", placeholder: "Languages and proficiency" },
  ],
};

const ATHLETE_ABROAD_READINESS: OnboardingStep = {
  id: "athlete-abroad-readiness",
  phase: "Abroad Phase 2 · Travel & Eligibility Readiness",
  title: "Check international readiness.",
  body: "Private readiness details help the support team surface the right next steps and risks.",
  fields: [
    { key: "passport_status", label: "Passport status", type: "select", options: ["Valid passport", "Application in progress", "Need to apply", "Need help"] },
    { key: "travel_experience", label: "International travel experience", type: "select", options: ["Frequent", "Some", "None yet"] },
    { key: "guardian_travel_support", label: "Family / guardian support", type: "select", options: ["Confirmed", "Discussing", "Need a trusted-adult plan", "Not applicable (18+)"] },
    { key: "international_readiness_needs", label: "Support needed", type: "multi-select", options: ["Academic eligibility", "Credential evaluation", "Visa guidance", "Housing", "Travel budget", "Insurance / healthcare", "Club / school vetting", "Language preparation", "Safety planning"] },
  ],
};

const NETWORK: OnboardingStep = {
  id: "network",
  phase: "Support Network",
  title: "Invite your support team.",
  body: "Invite family, mentors, coaches, counselors, partners, or trusted adults.",
  fields: [
    { key: "support_network", label: "Your Support Network", type: "support-network" },
  ],
};

const STARTING_FIVE: OnboardingStep = {
  id: "starting-five",
  phase: "Support Network · Starting Five",
  title: "Build the team behind your dreams.",
  body: "Add up to five trusted adults who can encourage you, celebrate milestones, and help you stay on course. Start with one person or return later.",
  fields: [
    {
      key: "support_network",
      label: "Your Starting Five",
      type: "support-network",
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

export const ROLE_ONBOARDING = {
  scholar: [
    IDENTITY("Scholar"),
    SCHOLAR_SUPPORT,
    SCHOLAR_ACADEMIC,
    SCHOLAR_GOALS,
    SCHOLAR_ACTIVITIES,
    STARTING_FIVE,
    USER_AGREEMENT,
  ],

  "scholar-athlete": [
    IDENTITY("Scholar-Athlete"),
    SCHOLAR_SUPPORT,
    SCHOLAR_ACADEMIC,
    ATHLETE_PROFILE,
    ATHLETE_RECRUITING,
    SCHOLAR_ACTIVITIES,
    STARTING_FIVE,
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
  counselor: [
    IDENTITY("High School Counselor"),
    COUNSELOR_VERIFICATION,
    COUNSELOR_CASELOAD,
    COUNSELOR_SUPPORT,
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
    STARTING_FIVE,
    USER_AGREEMENT,
  ],
  employer: [
    IDENTITY("Employer / Workforce Partner"),
    EMPLOYER_VERIFICATION,
    EMPLOYER_OPPORTUNITIES,
    EMPLOYER_SAFEGUARDS,
    NETWORK,
    USER_AGREEMENT,
  ],
  district: [
    IDENTITY("District / School Administrator"),
    DISTRICT_VERIFICATION,
    DISTRICT_IMPLEMENTATION,
    DISTRICT_GOVERNANCE,
    NETWORK,
    USER_AGREEMENT,
  ],
  "athlete-abroad": [
    IDENTITY("Athlete Abroad"),
    SCHOLAR_SUPPORT,
    SCHOLAR_ACADEMIC,
    ATHLETE_PROFILE,
    ATHLETE_RECRUITING,
    ATHLETE_ABROAD_ENROLLMENT,
    ATHLETE_ABROAD_READINESS,
    STARTING_FIVE,
    USER_AGREEMENT,
  ],
  other: [IDENTITY("Community Partner"), NETWORK, USER_AGREEMENT],
} satisfies Record<PlaybookRole, OnboardingStep[]>;

export function getOnboardingSteps(role?: string | null) {
  return ROLE_ONBOARDING[normalizePlaybookRole(role)];
}
import {
  normalizePlaybookRole,
  type PlaybookRole,
} from "@/lib/roles/registry";
