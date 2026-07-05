"use client";

import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

const eventTypes = [
  "College readiness workshops",
  "Financial literacy nights",
  "Mentor mixers",
  "Career panels",
  "Athlete recruiting sessions",
  "Community service events",
  "Campus visits",
];

export default function CommunityEventsPage() {
  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Community Events"
        title="Real-life connection matters."
        subtitle="Students need places to meet mentors, attend workshops, build confidence, explore opportunities, and connect beyond the screen."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/feed">Share Event Update</PlaybookButton>
          <PlaybookButton href="/mentor-connect" variant="secondary">Find Mentors</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Event Types" title="Opportunities to gather">
          {eventTypes.map((type) => (
            <p key={type} style={body}>✓ {type}</p>
          ))}
          <PlaybookPill>events foundation</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Coming Next" title="Event activation">
          <p style={body}>
            Next activation: persisted event listings, RSVP, attendance tracking,
            event photos, mentor matching, notifications, and reward events.
          </p>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};
