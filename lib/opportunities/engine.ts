import type { Opportunity } from "./types";

export function buildOpportunityMatches(record: any): Opportunity[] {
  const readiness = record?.readiness || {};
  const academics = record?.academics || {};
  const athletics = record?.athletics || {};
  const achievements = record?.achievements || {};

  const matches: Opportunity[] = [
    {
      id: "scholarships",
      title: "Scholarship Readiness",
      type: "scholarship",
      description: "Scholarship opportunities based on academic, leadership, and service signals.",
      readiness: Math.round(((readiness.academicReadiness || 0) + (readiness.leadershipReadiness || 0)) / 2),
      reasons: [
        academics.gpa ? "GPA information is available" : "GPA information is missing",
        achievements.certificates?.length ? "Certificates detected" : "No certificates detected yet",
        achievements.badges?.length ? "Badges detected" : "No badges detected yet",
      ],
      nextSteps: [
        "Add volunteer hours",
        "Complete one financial literacy certificate",
        "Request a recommendation",
      ],
    },
    {
      id: "college",
      title: "College Application Readiness",
      type: "college",
      description: "College readiness based on academic profile and stated goals.",
      readiness: readiness.academicReadiness || 0,
      reasons: [
        academics.dreamSchool ? "Dream school added" : "Dream school missing",
        academics.gpa ? "GPA added" : "GPA missing",
        academics.sat || academics.act ? "Test score added" : "Test score not added",
      ],
      nextSteps: [
        "Confirm A-G progress",
        "Add college list",
        "Track application deadlines",
      ],
    },
    {
      id: "career",
      title: "Career Readiness",
      type: "career",
      description: "Career readiness based on goals, activities, and verified achievements.",
      readiness: readiness.careerReadiness || 0,
      reasons: [
        record?.career?.idealProfession ? "Career goal added" : "Career goal missing",
        achievements.activities?.length ? "Activities logged" : "No activities logged",
        achievements.certificates?.length ? "Certificates earned" : "No certificates earned",
      ],
      nextSteps: [
        "Generate resume",
        "Add internship interests",
        "Complete career readiness course",
      ],
    },
    {
      id: "athletics",
      title: "Athletic Recruiting Readiness",
      type: "athletics",
      description: "Recruiting readiness for scholar-athletes.",
      readiness: athletics?.sport ? 55 : 0,
      reasons: [
        athletics?.sport ? "Sport listed" : "Sport not listed",
        athletics?.coachName ? "Coach information added" : "Coach information missing",
        athletics?.highlightVideo ? "Highlight video added" : "Highlight video missing",
      ],
      nextSteps: [
        "Add highlight video",
        "Add coach contact",
        "Track recruiting status",
      ],
    },
  ];

  return matches.sort((a,b)=>b.readiness-a.readiness);
}
