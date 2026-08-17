"use client";

import Link from "next/link";

export default function ScholarOpportunityGraphSection() {
  return (
    <section
      aria-labelledby="opportunity-readiness-heading"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 20,
        padding: 24,
        marginBottom: 14,
      }}
    >
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#64748B",
        marginBottom: 10,
      }}>
        Opportunity Intelligence
      </p>
      <h2 id="opportunity-readiness-heading" style={{ margin: "0 0 8px", color: "#0F172A" }}>
        Opportunity readiness uses your real Playbook evidence.
      </h2>
      <p style={{ color: "#64748B", lineHeight: 1.6, margin: "0 0 14px" }}>
        Playbook does not display sample courses or fabricated academic evidence on your Scholar Record. Open the Opportunity Marketplace to review published opportunities and your separate PBOS readiness guidance.
      </p>
      <Link
        href="/opportunities"
        style={{
          display: "inline-flex",
          background: "#F97316",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 999,
          padding: "10px 14px",
          fontSize: 13,
          fontWeight: 900,
        }}
      >
        Open Opportunity Marketplace →
      </Link>
    </section>
  );
}
