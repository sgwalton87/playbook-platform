export type FounderDemoChapter = {
  id: string;
  era: string;
  title: string;
  challenge: string;
  support: string[];
  playbookResponse: string[];
  href: string;
};

export const FOUNDER_DEMO_JOURNEY: FounderDemoChapter[] = [
  {
    id: "academic-foundation",
    era: "High School · Class of 2005",
    title: "Strong student. Elite athlete. Fragmented system.",
    challenge:
      "A 3.8 senior-year GPA and elite athletic ability created opportunity, but academic planning, recruiting, testing, and deadlines were coordinated informally.",
    support: [
      "Mom served as counselor and advocate.",
      "High school coaches maintained academic and athletic expectations.",
      "AAU leadership created recruiting exposure.",
    ],
    playbookResponse: [
      "Transcript Intelligence",
      "A–G and graduation readiness",
      "Testing timeline alerts",
      "Coordinated support actions",
    ],
    href: "/academic-readiness",
  },
  {
    id: "recruiting",
    era: "Recruiting",
    title: "Exposure created opportunity.",
    challenge:
      "Travel tournaments, coach relationships, official visits, and advocate-driven outreach created access that many equally talented athletes never receive.",
    support: [
      "AAU tournament exposure",
      "Handwritten outreach letters",
      "Coach and scout visibility",
      "Official college visits",
    ],
    playbookResponse: [
      "Scholar-Athlete OS",
      "Recruiting timeline",
      "Support Network",
      "Opportunity matching",
    ],
    href: "/scholar-athlete-os",
  },
  {
    id: "testing-timing",
    era: "Senior Year",
    title: "Timing changed the opportunity set.",
    challenge:
      "Taking the SAT earlier could have created time for retesting and expanded already extraordinary college options.",
    support: [
      "Strong grades",
      "Scholarship interest",
      "Multiple college pathways",
    ],
    playbookResponse: [
      "Compass deadline intelligence",
      "Testing reminders",
      "Escalation to supporters",
      "Opportunity deadline comparison",
    ],
    href: "/compass",
  },
  {
    id: "professional-athlete",
    era: "Professional Career",
    title: "Athletic income arrived before financial preparation.",
    challenge:
      "Professional basketball opportunities in Europe created income, but financial literacy, contract negotiation, investing, and long-term athlete wealth preparation were missing.",
    support: [
      "Professional playing experience",
      "International experience",
      "Career transition experience",
    ],
    playbookResponse: [
      "Financial literacy courses",
      "Athlete contract education",
      "NIL readiness",
      "Career transition planning",
    ],
    href: "/courses",
  },
  {
    id: "founder",
    era: "Today",
    title: "The lived experience becomes infrastructure.",
    challenge:
      "Too many students still depend on luck, individual advocates, or informal knowledge to navigate academic and opportunity systems.",
    support: [
      "Education leadership",
      "Financial services experience",
      "Athletic experience",
      "Technology entrepreneurship",
    ],
    playbookResponse: [
      "One connected Scholar Record",
      "Multi-role support operating systems",
      "Academic and opportunity intelligence",
      "Applications, learning, rewards, and economic mobility",
    ],
    href: "/start",
  },
];
