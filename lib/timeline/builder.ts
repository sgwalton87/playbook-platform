import type { TimelineEvent } from "./types";

export function buildScholarTimeline(record: any): TimelineEvent[] {
  const certificates = record?.achievements?.certificates || [];
  const badges = record?.achievements?.badges || [];
  const activities = record?.achievements?.activities || [];
  const posts = record?.achievements?.posts || [];

  return [
    ...certificates.map((c: any) => ({
      id: `certificate-${c.id}`,
      type: "certificate" as const,
      title: c.certificate_name || "Certificate Earned",
      description: "Completed a verified Playbook learning milestone.",
      date: c.issued_at,
      source: "certificates",
      verified: true,
    })),

    ...badges.map((b: any) => ({
      id: `badge-${b.id}`,
      type: "badge" as const,
      title: b.displayName || b.badges?.name || "Badge Earned",
      description: "Earned a Playbook badge.",
      date: b.awarded_at,
      source: "badges",
      verified: true,
    })),

    ...activities.map((a: any) => ({
      id: `activity-${a.id}`,
      type: "activity" as const,
      title: a.title || a.role_title || a.activity_type || "Activity Logged",
      description: a.description || "",
      date: a.created_at,
      source: "activities",
      verified: Boolean(a.verified),
    })),

    ...posts.map((p: any) => ({
      id: `post-${p.id}`,
      type: "post" as const,
      title: p.title || "Community Contribution",
      description: p.body || "",
      date: p.created_at,
      source: "posts",
      verified: false,
    })),
  ].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  });
}
