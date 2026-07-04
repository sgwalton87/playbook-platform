"use client";

import { getStephishaFounderCaseStudy } from "@/lib/demo/case-studies";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

export default function FounderCaseStudyDemo() {
  const study = getStephishaFounderCaseStudy();

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Demo Mode Case Study"
        title={study.title}
        subtitle={study.mission}
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Graduation Year" value={String(study.scholar.graduationYear)} />
        <PlaybookMetric label="Scholarships" value="70+" />
        <PlaybookMetric label="Senior GPA" value={study.scholar.gpaSeniorYear} />
        <PlaybookMetric label="Supporters" value={String(study.supportNetwork.length)} />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Scholar-Athlete Profile" title={study.scholar.name}>
          <p style={body}>{study.scholar.highSchool}</p>
          <p style={body}>Visits: {study.scholar.visits.join(", ")}</p>
          <PlaybookPill>{study.scholar.athleticPathway}</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Support Network" title="The team behind the opportunity">
          {study.supportNetwork.map((person) => (
            <p key={person.name} style={body}>
              <strong>{person.name}</strong> — {person.role}: {person.contribution}
            </p>
          ))}
        </PlaybookCard>

        <PlaybookCard eyebrow="Lessons" title="What Playbook solves">
          {study.opportunityLessons.map((lesson) => (
            <p key={lesson} style={body}>✓ {lesson}</p>
          ))}
        </PlaybookCard>

        <PlaybookCard eyebrow="Platform Translation" title="How the ecosystem responds">
          {study.platformTranslation.map((item) => (
            <p key={item} style={body}>✓ {item}</p>
          ))}
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};
