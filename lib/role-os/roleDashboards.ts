import type { PlaybookRoleOS } from "./roleOS";

export function getRoleDashboard(role: PlaybookRoleOS) {
  const dashboards = {
    learner: {
      title: "Learner OS",
      greeting: "Good morning, Maya.",
      question: "What should I do next?",
      metrics: [
        ["Academic DNA", "88%"],
        ["Trust Score", "78%"],
        ["Opportunities", "14"],
        ["Growth Score", "84%"],
      ],
      actions: ["Finish English Reflection", "Save top scholarship", "Ask Oracle about UC eligibility", "Add one evidence item"],
      insight: "Your Biology work strengthened your STEM and health science pathways.",
    },
    family: {
      title: "Family OS",
      greeting: "Your scholar is making progress.",
      question: "How can I support my scholar today?",
      metrics: [
        ["On Track", "Yes"],
        ["A-G Progress", "81%"],
        ["Scholarships", "12"],
        ["Deadlines", "2"],
      ],
      actions: ["Review FAFSA checklist", "RSVP to college night", "Congratulate Maya on Biology", "Help upload tax documents"],
      insight: "Family support this week can improve scholarship readiness.",
    },
    educator: {
      title: "Educator OS",
      greeting: "Students needing support are visible.",
      question: "Who needs me today?",
      metrics: [
        ["Students", "180"],
        ["Need Support", "18"],
        ["A-G Alerts", "13"],
        ["Verifications", "9"],
      ],
      actions: ["Review A-G alerts", "Verify student evidence", "Recommend intervention", "Message high-priority scholars"],
      insight: "Early signals show which students need academic or opportunity support.",
    },
    district: {
      title: "District OS",
      greeting: "System readiness is measurable.",
      question: "Where are opportunity gaps forming?",
      metrics: [
        ["College Ready", "89%"],
        ["FAFSA", "76%"],
        ["A-G Complete", "81%"],
        ["Scholarship Potential", "$6.3M"],
      ],
      actions: ["Review school readiness map", "Identify opportunity gaps", "Prioritize FAFSA support", "Export board briefing"],
      insight: "Opportunity gaps are highest in STEM internships and FAFSA completion.",
    },
    university: {
      title: "University OS",
      greeting: "Verified talent is emerging earlier.",
      question: "Which scholars fit our pathways?",
      metrics: [
        ["Verified Scholars", "421"],
        ["Health Science", "111"],
        ["Engineering", "82"],
        ["Leadership Index", "93%"],
      ],
      actions: ["Review verified scholars", "Filter by pathway", "Invite students to program", "Create outreach list"],
      insight: "Scholar Records show readiness beyond GPA alone.",
    },
    employer: {
      title: "Employer OS",
      greeting: "Career-ready talent is visible.",
      question: "Who is ready for opportunity?",
      metrics: [
        ["Verified Talent", "113"],
        ["Career Ready", "87%"],
        ["Internship Matches", "34"],
        ["Soft Skills", "Verified"],
      ],
      actions: ["Review talent pipeline", "Create internship opportunity", "Filter by verified skills", "Invite candidates"],
      insight: "Trust signals help employers match opportunity to verified growth.",
    },
    mentor: {
      title: "Mentor OS",
      greeting: "Your scholars need encouragement and direction.",
      question: "Who am I helping this week?",
      metrics: [
        ["Active Scholars", "8"],
        ["Check-ins Due", "3"],
        ["Opportunities", "11"],
        ["Encouragement Wins", "5"],
      ],
      actions: ["Schedule weekly check-in", "Review Maya's next step", "Practice mock interview", "Celebrate recent evidence"],
      insight: "Mentors help translate guidance into confidence, action, and follow-through.",
    },
  };

  return dashboards[role];
}
