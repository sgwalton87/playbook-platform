"use client";

type Props = {
  stats: {
    level?: number;
    xp?: number;
    coins?: number;
    skills?: number;
    certificates?: number;
    courses?: number;
    leadership?: number;
    volunteerHours?: number;
  };
};

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 18,
        padding: 18,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F8F6F1",
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 13,
          color: "#94A3B8",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function PortfolioStats({ stats }: Props) {
  return (
    <section style={{ marginTop: 32 }}>
      <h2
        style={{
          color: "#F8F6F1",
          marginBottom: 18,
        }}
      >
        Portfolio Stats
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 16,
        }}
      >
        <StatCard label="Level" value={stats.level ?? 1} />
        <StatCard label="XP" value={stats.xp ?? 0} />
        <StatCard label="Coins" value={stats.coins ?? 0} />
        <StatCard label="Skills" value={stats.skills ?? 0} />
        <StatCard label="Certificates" value={stats.certificates ?? 0} />
        <StatCard label="Courses" value={stats.courses ?? 0} />
        <StatCard label="Leadership" value={stats.leadership ?? 0} />
        <StatCard label="Volunteer Hours" value={stats.volunteerHours ?? 0} />
      </div>
    </section>
  );
}
