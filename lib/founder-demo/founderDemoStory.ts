export type FounderQuarter = {
  id: string;
  quarter: string;
  title: string;
  subtitle: string;
  story: string;
  playbookLesson: string;
  route: string;
  routeLabel: string;
  quote: string;
  images: string[];
};

export const FOUNDER_QUARTERS: FounderQuarter[] = [
  {
    id: "q1-scholar",
    quarter: "First Quarter",
    title: "The Scholar",
    subtitle: "Public middle school. Private high school. Back to public school. Same talent, different systems.",
    story:
      "Stephisha's journey began across school systems: public middle school, St. Patrick–St. Vincent for 9th–11th grade, then Vallejo High for 12th grade. The archive shows recruiting letters, articles, handwritten notes, and the reality that talent can be visible while guidance is still uneven.",
    playbookLesson:
      "The Playbook makes the scholar—not the school—the center of the record. Transcript, A-G progress, opportunities, mentors, and decisions should travel with the student.",
    route: "/transcript",
    routeLabel: "See Transcript + A-G",
    quote:
      "Talent should not have to depend on which school has the most time, access, or relationships.",
    images: [
      "/demo/founder-archive/transparent/founder-archive-01.png",
      "/demo/founder-archive/transparent/founder-archive-02.png",
      "/demo/founder-archive/special/founder-archive-03.png",
      "/demo/founder-archive/transparent/founder-archive-04.png",
      "/demo/founder-archive/transparent/founder-archive-05.png",
      "/demo/founder-archive/transparent/founder-archive-06.png",
      "/demo/founder-archive/transparent/founder-archive-07.png",
      "/demo/founder-archive/transparent/founder-archive-08.png",
      "/demo/founder-archive/special/founder-archive-09.png",
    ],
  },
  {
    id: "q2-athlete",
    quarter: "Second Quarter",
    title: "The Athlete",
    subtitle: "Recruitment, college basketball, tryouts, rejection, and the overseas breakthrough.",
    story:
      "The athletic journey included major recruiting attention, college pathways, a WNBA tryout attempt, and eventually making it professionally overseas without an agent. The foreign-language newspaper article becomes proof of the breakthrough: when one door did not open, another path was created.",
    playbookLesson:
      "The Playbook helps scholar-athletes organize opportunity, preserve evidence, compare pathways, and prepare for what comes after the game.",
    route: "/opportunities",
    routeLabel: "See Opportunity Graph",
    quote:
      "Attention is not the same as navigation. A scholar-athlete needs both visibility and a plan.",
    images: [
      "/demo/founder-archive/special/founder-archive-10.png",
      "/demo/founder-archive/transparent/founder-archive-11.png",
      "/demo/founder-archive/transparent/founder-archive-12.png",
      "/demo/founder-archive/transparent/founder-archive-13.png",
      "/demo/founder-archive/transparent/founder-archive-14.png",
      "/demo/founder-archive/transparent/founder-archive-15.png",
      "/demo/founder-archive/transparent/founder-archive-16.png",
      "/demo/founder-archive/transparent/founder-archive-17.png",
      "/demo/founder-archive/transparent/founder-archive-18.png",
    ],
  },
  {
    id: "q3-pivot",
    quarter: "Third Quarter",
    title: "The Pivot",
    subtitle: "Medical school acceptance, no access to capital, and the financial-services turn.",
    story:
      "In 2013, Stephisha was accepted to American University of Antigua for medical school but could not attend because she lacked access to the capital required. That hurdle redirected her into financial services, where she became licensed in insurance, investments, and mortgage lending.",
    playbookLesson:
      "The Playbook connects career planning, financial literacy, mentorship, and transition support so students understand not only how to access opportunity, but how to sustain it.",
    route: "/compass",
    routeLabel: "See Compass",
    quote:
      "A closed door can become curriculum when the lesson becomes infrastructure for the next scholar.",
    images: [
      "/demo/founder-archive/transparent/founder-archive-19.png",
      "/demo/founder-archive/transparent/founder-archive-20.png",
      "/demo/founder-archive/transparent/founder-archive-21.png",
      "/demo/founder-archive/transparent/founder-archive-22.png",
      "/demo/founder-archive/transparent/founder-archive-23.png",
      "/demo/founder-archive/transparent/founder-archive-24.png",
      "/demo/founder-archive/transparent/founder-archive-25.png",
      "/demo/founder-archive/special/founder-archive-26.png",
      "/demo/founder-archive/transparent/founder-archive-27.png",
    ],
  },
  {
    id: "q4-builder",
    quarter: "Fourth Quarter",
    title: "The Builder",
    subtitle: "Entrepreneur, public servant, financial professional, and founder of The Playbook.",
    story:
      "Every hurdle built another piece of the system: athlete, financial advisor, entrepreneur, independent contractor, insurance and investment professional, mortgage loan originator, City of Oakland Budget Advisory Commissioner, and founder/operator of Playbook Series Inc.",
    playbookLesson:
      "The Playbook is the buzzer beater: a connected system arriving in time to help public education, underserved scholars, scholar-athletes, LGBTQIA+ youth, and transition-age young people build the next play.",
    route: "/start",
    routeLabel: "Enter The Playbook",
    quote:
      "Every hurdle brought me to this moment. This is the buzzer beater for the scholars coming next.",
    images: [
      "/demo/founder-archive/transparent/founder-archive-28.png",
      "/demo/founder-archive/transparent/founder-archive-29.png",
      "/demo/founder-archive/transparent/founder-archive-30.png",
      "/demo/founder-archive/transparent/founder-archive-31.png",
      "/demo/founder-archive/transparent/founder-archive-32.png",
      "/demo/founder-archive/transparent/founder-archive-33.png",
      "/demo/founder-archive/special/founder-archive-34.png",
      "/demo/founder-archive/special/founder-archive-35.png",
      "/demo/founder-archive/transparent/founder-archive-36.png",
    ],
  },
];

export function getFounderQuarter(index: number) {
  return FOUNDER_QUARTERS[index] || FOUNDER_QUARTERS[0];
}
