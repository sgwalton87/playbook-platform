import type { TrustLevel, TrustReport, TrustSignal } from "./types";

function getTrustLevel(score: number): TrustLevel {
  if (score >= 90) return "impact";
  if (score >= 75) return "outcome";
  if (score >= 60) return "verification";
  if (score >= 40) return "evidence";
  if (score >= 20) return "achievement";
  return "activity";
}

export function buildTrustReport(record: LegacyValue): TrustReport {
  const achievements = record?.achievements || {};
  const certificates = achievements.certificates || [];
  const badges = achievements.badges || [];
  const activities = achievements.activities || [];
  const posts = achievements.posts || [];

  const signals: TrustSignal[] = [
    {
      id: "certificates",
      label: "Certificates attached",
      level: "evidence",
      points: certificates.length > 0 ? 20 : 0,
      verified: certificates.length > 0,
    },
    {
      id: "badges",
      label: "Badges earned",
      level: "achievement",
      points: badges.length > 0 ? 15 : 0,
      verified: badges.length > 0,
    },
    {
      id: "activities",
      label: "Activities logged",
      level: "achievement",
      points: activities.length > 0 ? 15 : 0,
      verified: activities.some((a: LegacyValue) => a.verified),
    },
    {
      id: "verified-activities",
      label: "Verified activities",
      level: "verification",
      points: activities.some((a: LegacyValue) => a.verified) ? 20 : 0,
      verified: activities.some((a: LegacyValue) => a.verified),
    },
    {
      id: "community-signals",
      label: "Community contributions",
      level: "activity",
      points: posts.length > 0 ? 10 : 0,
      verified: false,
    },
    {
      id: "reflection",
      label: "Reflection evidence",
      level: "evidence",
      points: activities.some((a: LegacyValue) => a.reflection || a.reflection_text) ? 10 : 0,
      verified: false,
    },
    {
      id: "outcomes",
      label: "Outcomes documented",
      level: "outcome",
      points: activities.some((a: LegacyValue) => a.outcome || a.outcomes) ? 10 : 0,
      verified: false,
    },
  ];

  const score = Math.min(
    100,
    signals.reduce((sum, signal) => sum + signal.points, 0)
  );

  const missing = [
    certificates.length === 0 && "Attach certificates or completed course evidence",
    badges.length === 0 && "Earn or attach badges",
    activities.length === 0 && "Log activities, service, leadership, or athletics",
    !activities.some((a: LegacyValue) => a.verified) && "Request verification from a trusted adult or organization",
    !activities.some((a: LegacyValue) => a.reflection || a.reflection_text) && "Add a reflection to at least one achievement",
    !activities.some((a: LegacyValue) => a.outcome || a.outcomes) && "Add outcomes or impact to at least one achievement",
  ].filter(Boolean) as string[];

  return {
    score,
    level: getTrustLevel(score),
    signals,
    missing,
  };
}
