"use client";

import { useEffect, useState } from "react";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

export default function ModerationPage() {
  const [reports, setReports] = useState<Array<{ id: string; target_type: string; category: string; detail: string | null; severity: string; status: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/admin/moderation");
    const json = await res.json();

    setReports(json.reports || []);
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);


  async function update(
    reportId: string,
    status: "triaged" | "resolved" | "dismissed"
  ) {
    const reason = window.prompt("Document the reason for this moderation decision.");
    if (!reason?.trim()) return;
    await fetch("/api/admin/moderation", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId,
        status, reason: reason.trim(),
      }),
    });

    await load();
  }


  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Trust & Safety"
        title="Moderation Queue"
        subtitle="Review reports from the Playbook community and document moderation decisions."
      />

      {loading ? (
        <PlaybookCard
          eyebrow="Loading"
          title="Reviewing moderation queue"
        >
          <p style={body}>Loading reports...</p>
        </PlaybookCard>
      ) : (
        <PlaybookGrid>
          {reports.map((report) => (
            <PlaybookCard
              key={report.id}
              eyebrow={report.target_type}
              title={report.category.replaceAll("_", " ")}
            >
              <p style={body}>
                {report.detail || "No additional detail provided."}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <PlaybookPill>
                  {report.severity} · {report.status}
                </PlaybookPill>

                <PlaybookPill>
                  {new Date(report.created_at).toLocaleDateString()}
                </PlaybookPill>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => update(report.id, "triaged")}
                  style={button}
                >
                  Review
                </button>

                <button
                  onClick={() => update(report.id, "resolved")}
                  style={button}
                >
                  Resolve
                </button>

                <button
                  onClick={() => update(report.id, "dismissed")}
                  style={secondaryButton}
                >
                  Dismiss
                </button>
              </div>
            </PlaybookCard>
          ))}

          {!reports.length && (
            <PlaybookCard
              eyebrow="Queue Clear"
              title="No open reports"
            >
              <p style={body}>
                There are no reports waiting for review.
              </p>
            </PlaybookCard>
          )}
        </PlaybookGrid>
      )}
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};

const button: React.CSSProperties = {
  border: 0,
  borderRadius: 10,
  padding: "10px 12px",
  background: "#0F172A",
  color: "#F8F7F4",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  ...button,
  background: "#E2E8F0",
  color: "#0F172A",
};
