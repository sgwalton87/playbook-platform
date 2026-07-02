"use client";

import ScholarRecordSummary from "@/components/scholar/ScholarRecordSummary";

type Props = {
  record: any;
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 20,
        padding: 24,
        marginBottom: 14,
      }}
    >
      <p
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#64748B",
          marginBottom: 12,
        }}
      >
        {title}
      </p>

      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "7px 0",
        borderBottom: "1px solid #E2E8F0",
      }}
    >
      <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
      <strong style={{ fontSize: 12, color: "#0F172A", textAlign: "right" }}>
        {value || "—"}
      </strong>
    </div>
  );
}

export default function ScholarRecordDashboard({ record }: Props) {
  const academics = record?.academics || {};
  const career = record?.career || {};
  const athletics = record?.athletics || {};
  const service = record?.service || {};
  const achievements = record?.achievements || {};
  const leadership = record?.leadership || {};

  return (
    <div style={{ marginBottom: 14 }}>
      <ScholarRecordSummary record={record} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <SectionCard title="Academics">
          <Row label="GPA" value={academics.gpa || academics.weightedGpa || academics.unweightedGpa} />
          <Row label="Dream School" value={academics.dreamSchool} />
          <Row label="Intended Major" value={academics.intendedMajor} />
          <Row label="SAT" value={academics.sat} />
          <Row label="ACT" value={academics.act} />
        </SectionCard>

        <SectionCard title="Career">
          <Row label="Ideal Profession" value={career.idealProfession} />
          <Row label="Salary Goal" value={career.desiredSalaryRange} />
          <Row label="Career Readiness" value={`${record?.readiness?.careerReadiness ?? 0}%`} />
        </SectionCard>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <SectionCard title="Athletics">
          <Row label="Sport" value={athletics.sport} />
          <Row label="Position" value={athletics.position} />
          <Row label="Travel Team" value={athletics.travelTeam} />
          <Row label="Coach" value={athletics.coachName} />
          <Row label="Recruiting Status" value={athletics.recruitingStatus} />
        </SectionCard>

        <SectionCard title="Service + Leadership">
          <Row label="Volunteer Hours" value={service.volunteerHours ?? 0} />
          <Row label="Activities" value={service.activities?.length ?? 0} />
          <Row label="Badges" value={leadership.badges?.length ?? 0} />
          <Row label="Leadership Score" value={leadership.leadershipScore ?? 0} />
        </SectionCard>
      </div>

      <SectionCard title="Achievements">
        <Row label="Certificates" value={achievements.certificates?.length ?? 0} />
        <Row label="Badges" value={achievements.badges?.length ?? 0} />
        <Row label="Activities" value={achievements.activities?.length ?? 0} />
        <Row label="Posts" value={achievements.posts?.length ?? 0} />
        <Row label="Total Verified Signals" value={achievements.total ?? 0} />
      </SectionCard>
    </div>
  );
}
