export type CapabilityStatus = "available" | "built-in" | "in-audit" | "planned";

export type CapabilityItem = {
  label: string;
  description: string;
  href?: string;
  status: CapabilityStatus;
  roles?: string[];
};

export type CapabilityGroup = {
  id: string;
  label: string;
  description: string;
  icon: string;
  items: CapabilityItem[];
};

export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    id: "record",
    label: "My Playbook Record",
    description: "Identity, evidence, achievements, privacy, and the living record that powers the rest of Playbook.",
    icon: "◈",
    items: [
      { label: "Private profile", description: "Edit the identity and story behind your Playbook Record.", href: "/profile", status: "available" },
      { label: "Profile privacy", description: "Publish or revoke the public-safe profile projection with explicit consent.", href: "/profile/privacy", status: "available" },
      { label: "Playbook Record", description: "Review the learner-facing record of evidence, milestones, and progress.", href: "/record", status: "available" },
      { label: "Transcript", description: "Upload, review, and activate academic evidence.", href: "/transcript", status: "available" },
      { label: "Albums & media", description: "Organize visual evidence and portfolio media.", href: "/albums", status: "available" },
      { label: "Badges", description: "View earned recognition attached to meaningful progress.", href: "/badges", status: "available" },
      { label: "Certificates", description: "Access certificates earned through learning and verified completion.", href: "/certificates", status: "available" },
      { label: "Public timeline", description: "Scholar-controlled public timeline projection.", status: "planned" },
      { label: "Cover photo & gallery", description: "Expanded public portfolio presentation and gallery controls.", status: "planned" },
    ],
  },
  {
    id: "academics",
    label: "Academics & College Readiness",
    description: "Turn academic records, deadlines, and college goals into a clear plan.",
    icon: "△",
    items: [
      { label: "Academic readiness", description: "See evidence-backed readiness, gaps, and next actions.", href: "/academic-readiness", status: "available" },
      { label: "Transcript intelligence", description: "Use transcript evidence to understand academic progress.", href: "/transcript", status: "available" },
      { label: "Application workspace", description: "Prepare and manage governed opportunity applications.", href: "/opportunity-toolkit", status: "available" },
      { label: "A-G tracker", description: "Track UC/CSU A-G completion against canonical coursework.", status: "planned" },
      { label: "FAFSA tracker", description: "Track FAFSA completion, milestones, and deadlines.", status: "planned" },
      { label: "College search", description: "Discover colleges using goals, fit, and verified academic context.", status: "planned" },
      { label: "Dream & top schools", description: "Manage aspirational and best-fit school lists without duplicating the Scholar Record.", status: "planned" },
      { label: "Application deadlines", description: "Centralize real deadlines and application progress.", status: "planned" },
    ],
  },
  {
    id: "opportunities",
    label: "Opportunities & Applications",
    description: "Discover real opportunities, understand readiness, and move from interest to application.",
    icon: "↗",
    items: [
      { label: "Opportunity marketplace", description: "Browse human-reviewed canonical opportunities separately from PBOS readiness guidance.", href: "/opportunities", status: "available" },
      { label: "Application workspace", description: "Build and submit learner-owned application workspaces.", href: "/opportunity-toolkit", status: "available" },
      { label: "Scholarships", description: "Scholarship discovery through the canonical opportunity catalog.", href: "/opportunities", status: "available" },
      { label: "Internships & jobs", description: "Career opportunities through the same governed opportunity catalog.", href: "/opportunities", status: "available" },
      { label: "Mentorship opportunities", description: "Mentorship opportunities and pathways without creating a second marketplace.", href: "/opportunities", status: "available" },
      { label: "Opportunity tracking", description: "Outcome and lifecycle tracking after application or selection.", status: "planned" },
      { label: "Applicant consent sharing", description: "Explicit Scholar consent before partners receive an applicant projection.", status: "in-audit" },
    ],
  },
  {
    id: "recruiting",
    label: "Recruiting & NIL",
    description: "A Scholar-Athlete command center for evidence, recruiting relationships, visits, offers, and NIL readiness.",
    icon: "★",
    items: [
      { label: "Scholar-Athlete OS", description: "Open the athlete command center and next-action view.", href: "/scholar-athlete-os", status: "available", roles: ["scholar-athlete"] },
      { label: "Athlete profile & film", description: "Build the canonical athlete profile and highlight-film evidence.", href: "/recruiting/profile", status: "available", roles: ["scholar-athlete"] },
      { label: "Athletic evidence", description: "Record measurements, statistics, honors, and verification evidence.", href: "/recruiting/evidence", status: "available", roles: ["scholar-athlete"] },
      { label: "Eligibility", description: "Review source-backed athletic eligibility status and evidence.", href: "/recruiting/eligibility", status: "available", roles: ["scholar-athlete"] },
      { label: "College targets", description: "Manage target programs and recruiting pipeline state.", href: "/recruiting/targets", status: "available", roles: ["scholar-athlete"] },
      { label: "Visits", description: "Plan and record official, unofficial, camp, game, and virtual visits.", href: "/recruiting/visits", status: "available", roles: ["scholar-athlete"] },
      { label: "Offers", description: "Preserve self-reported offer evidence and correction history.", href: "/recruiting/offers", status: "available", roles: ["scholar-athlete"] },
      { label: "Recruiting timeline", description: "See recruiting activity as a chronological evidence trail.", href: "/recruiting/timeline", status: "available", roles: ["scholar-athlete"] },
      { label: "Coach & recruiter discovery", description: "Find and connect with verified recruiting professionals.", href: "/recruiting/people", status: "available", roles: ["scholar-athlete"] },
      { label: "NIL readiness", description: "Prepare brand, compliance, finance, contracts, and social professionalism.", href: "/recruiting/nil", status: "available", roles: ["scholar-athlete"] },
      { label: "NIL media kit", description: "Build a governed athlete media kit from canonical data.", href: "/recruiting/nil/media-kit", status: "available", roles: ["scholar-athlete"] },
      { label: "NIL deals", description: "Track NIL deal readiness and lifecycle without implying approval or compliance.", href: "/recruiting/nil/deals", status: "available", roles: ["scholar-athlete"] },
    ],
  },
  {
    id: "community",
    label: "Community & Relationships",
    description: "Build trusted relationships, share updates, and stay connected to the people around your journey.",
    icon: "∞",
    items: [
      { label: "Community feed", description: "Create and engage with community posts using real member identity.", href: "/feed", status: "available" },
      { label: "Connections", description: "Manage connection requests and your trusted network.", href: "/connections", status: "available" },
      { label: "Support network", description: "Coordinate authorized family, mentors, coaches, counselors, and supporters.", href: "/support-network", status: "available" },
      { label: "Mentor Connect", description: "Explore mentorship and trusted support pathways.", href: "/mentor-connect", status: "available" },
      { label: "Messaging", description: "Communicate through the governed messaging service.", href: "/messages", status: "available" },
      { label: "Notifications", description: "See shared platform attention, messaging, and workflow notifications.", href: "/notifications", status: "available" },
      { label: "Mutual connections", description: "Surface mutual-network context where authorized.", status: "planned" },
      { label: "Group messaging", description: "Multi-person governed conversations.", status: "planned" },
    ],
  },
  {
    id: "learning",
    label: "Learning & Growth",
    description: "Courses, progress, reflections, assessments, and recognition that strengthen the Playbook Record.",
    icon: "◇",
    items: [
      { label: "Course library", description: "Browse available Playbook learning experiences.", href: "/courses", status: "available" },
      { label: "Course detail & modules", description: "Open course modules and learning content.", href: "/courses", status: "available" },
      { label: "Community Safety course", description: "Learning pathway focused on safe, healthy communities.", href: "/courses", status: "available" },
      { label: "Athletes Abroad course", description: "Global-athlete readiness learning pathway.", href: "/courses/athletes-abroad-global-hub", status: "available" },
      { label: "Progress tracking", description: "Persisted progress through course modules.", status: "in-audit" },
      { label: "Reflections", description: "Learner reflections connected to course completion and the Scholar Record.", status: "planned" },
      { label: "Quizzes & assessments", description: "Course assessments with transparent scoring and progress state.", status: "planned" },
    ],
  },
  {
    id: "events",
    label: "Events & Experiences",
    description: "Discover events, RSVP, participate, check in, connect, and revisit event learning.",
    icon: "◍",
    items: [
      { label: "Browse events", description: "Browse published shared community events.", href: "/events", status: "available" },
      { label: "Event detail", description: "Open canonical event details, RSVP state, networking, and replay metadata.", href: "/events", status: "available" },
      { label: "RSVP", description: "Going, interested, and cancellation states through the shared Events service.", href: "/events", status: "available" },
      { label: "Calendar integration", description: "Add canonical event details to Google Calendar.", href: "/events", status: "available" },
      { label: "QR check-in", description: "Record arrival evidence without self-verifying attendance or rewards.", href: "/events", status: "in-audit" },
      { label: "Event networking", description: "Explicit attendee opt-in with a privacy-safe directory.", href: "/events", status: "in-audit" },
      { label: "Replay library", description: "Access event-owned replay links when available.", href: "/events/replays", status: "in-audit" },
      { label: "Event reminders", description: "Scheduled reminders through the shared Notifications service.", href: "/events/reminders", status: "available" },
      { label: "Summit events", description: "Summit experiences represented through the shared Events service.", href: "/events", status: "available" },
    ],
  },
  {
    id: "rewards",
    label: "Rewards & Recognition",
    description: "Recognition for meaningful progress without manufacturing achievement.",
    icon: "◆",
    items: [
      { label: "Reward economy", description: "See the shared reward economy and earned recognition.", href: "/reward-economy", status: "available" },
      { label: "Badges", description: "Recognition attached to verified progress.", href: "/badges", status: "available" },
      { label: "Certificates", description: "Learning and completion certificates.", href: "/certificates", status: "available" },
      { label: "XP", description: "Experience-point recognition through the shared reward service.", status: "in-audit" },
      { label: "Coins", description: "Coin rewards through the shared reward service.", status: "in-audit" },
    ],
  },
  {
    id: "global",
    label: "Athletes Abroad",
    description: "Prepare for international sport with academics, contracts, culture, finance, health, and trusted support connected.",
    icon: "◎",
    items: [
      { label: "Athlete Abroad OS", description: "Open the governed global-athlete command center.", href: "/athlete-abroad-os", status: "available", roles: ["athlete-abroad"] },
      { label: "Global readiness course", description: "Prepare for the practical realities of competing abroad.", href: "/courses/athletes-abroad-global-hub", status: "available" },
      { label: "Go Abroad pathway", description: "Opportunity, document, contact, and destination planning.", status: "planned" },
      { label: "Living Abroad", description: "Housing, healthcare, culture, emergency, and daily-life resources.", status: "planned" },
      { label: "Life After Sport", description: "Career transition, education, financial planning, and alumni support.", status: "planned" },
      { label: "Country & sport channels", description: "Trusted community spaces organized around destination and sport.", status: "planned" },
      { label: "Global locker room", description: "Governed peer community for international athletes.", status: "planned" },
      { label: "Summit & meetups", description: "Shared Events-powered global gatherings and meetings.", status: "planned" },
    ],
  },
  {
    id: "roles",
    label: "Role Operating Systems",
    description: "Purpose-built workspaces that inherit shared Playbook services and enforce role-specific authority.",
    icon: "▦",
    items: [
      { label: "Scholar OS", description: "Learner command center grounded in the Scholar Record.", href: "/dashboard", status: "available", roles: ["scholar"] },
      { label: "Scholar-Athlete OS", description: "Athletics, recruiting, eligibility, and NIL extension of Scholar OS.", href: "/scholar-athlete-os", status: "available", roles: ["scholar-athlete"] },
      { label: "Family OS", description: "Relationship-gated family/guardian support workspace.", href: "/family-os", status: "available", roles: ["family"] },
      { label: "Mentor OS", description: "Validated mentor support workspace.", href: "/mentor-os", status: "available", roles: ["mentor"] },
      { label: "Educator OS", description: "Verified educator workspace with authorized Scholar context.", href: "/educator-os", status: "available", roles: ["educator"] },
      { label: "Counselor OS", description: "Verified counselor academic and support workspace.", href: "/counselor-os", status: "available", roles: ["high-school-counselor"] },
      { label: "Coach OS", description: "Verified high-school coach workspace.", href: "/coach-os", status: "available", roles: ["coach"] },
      { label: "Recruiting OS", description: "Verified college coach/recruiter workspace.", href: "/recruiting-os", status: "available", roles: ["college-coach"] },
      { label: "Admissions OS", description: "Verified college admissions workspace.", href: "/admissions-os", status: "available", roles: ["college-admissions"] },
      { label: "Brand Partner OS", description: "Verified organization and opportunity workspace.", href: "/brand-partner-os", status: "available", roles: ["brand-partner"] },
      { label: "Employer OS", description: "Verified employer/workforce partner workspace.", href: "/employer-os", status: "available", roles: ["employer"] },
      { label: "District OS", description: "Verified district/school administrator workspace.", href: "/district-os", status: "available", roles: ["district"] },
      { label: "Community Partner OS", description: "Verified community-partner workspace.", href: "/community-partner-os", status: "available", roles: ["other"] },
      { label: "Transition Youth OS", description: "Self-owned transition-aged youth journey workspace.", href: "/transition-youth-os", status: "available", roles: ["transition-youth"] },
    ],
  },
  {
    id: "platform",
    label: "Platform Foundations",
    description: "Shared capabilities inherited everywhere instead of duplicated inside individual operating systems.",
    icon: "⌘",
    items: [
      { label: "Authentication & PKCE", description: "Secure authentication and callback exchange across the platform.", status: "built-in" },
      { label: "Remember Me & session lifecycle", description: "Browser-session or persistent authentication based on explicit user choice.", status: "built-in" },
      { label: "Session timeout", description: "Shared inactivity warning and sign-out behavior.", status: "built-in" },
      { label: "Role authorization", description: "Canonical role and relationship gates across operating systems.", status: "built-in" },
      { label: "Privacy & least privilege", description: "Default-deny public projection and least-privilege data access.", status: "built-in" },
      { label: "Shared messaging", description: "One messaging service inherited across operating systems.", href: "/messages", status: "available" },
      { label: "Shared notifications", description: "One notification attention layer inherited across operating systems.", href: "/notifications", status: "available" },
      { label: "Shared Events", description: "One canonical Events service for community and role experiences.", href: "/events", status: "available" },
      { label: "Shared Courses", description: "One canonical Learning service for role experiences.", href: "/courses", status: "available" },
    ],
  },
];

export const CAPABILITY_STATUS_LABELS: Record<CapabilityStatus, string> = {
  available: "Available",
  "built-in": "Built into platform",
  "in-audit": "In audit",
  planned: "Planned",
};
