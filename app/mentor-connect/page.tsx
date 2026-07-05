"use client";

import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

const mentorTypes = [
  "Mentors",
  "Teachers",
  "Counselors",
  "Coaches",
  "Administrators",
  "College reps",
  "Employers",
];

export default function MentorConnectPage() {
  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Mentor Connect"
        title="Find the people who can help."
        subtitle="Invited mentors, teachers, counselors, coaches, and administrators should become searchable support resources once they join Playbook."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/invitations">Invite Supporter</PlaybookButton>
          <PlaybookButton href="/support-network" variant="secondary">My Support Network</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Support Directory" title="Search by role">
          {mentorTypes.map((type) => (
            <p key={type} style={body}>✓ {type}</p>
          ))}
          <PlaybookPill>directory foundation</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="How it works" title="Invites build the database">
          <p style={body}>
            When a mentor, teacher, admin, coach, or counselor accepts an invite,
            they should be added to a searchable support directory with their role,
            organization, and approved visibility.
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
