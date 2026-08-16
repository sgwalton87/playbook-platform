import Link from "next/link";
import CanonicalPublicNav from "@/components/public/CanonicalPublicNav";
import CanonicalPublicFooter from "@/components/public/CanonicalPublicFooter";
import { roleOptions } from "@/lib/role-os/roleRoutes";

const productSurfaces = [
  ["Public landing", "/", "Canonical Playbook entry, brand story, and public navigation."],
  ["Public newsfeed", "/news", "Community stories intentionally published for public viewing."],
  ["Role selection", "/role-select", "All 15 canonical onboarding pathways from the shared role registry."],
  ["Academic Readiness", "/academic-readiness", "Evidence → intelligence → action → support."],
  ["Network", "/login?next=/connections", "Bounded public identity discovery and governed connection state."],
  ["Learning", "/login?next=/courses", "Durable courses, module completion, credentials, badges, XP, and coins."],
  ["Reward Store", "/login?next=/store", "Ledger-backed balance, inventory, and idempotent redemption authority."],
  ["Events", "/login?next=/events", "Published community events, capacity-safe RSVP, and verified attendance rewards."],
  ["Mentorship Circles", "/login?next=/mentorship", "Mentor-owned circles with membership and waitlist lifecycle."],
  ["Opportunity Marketplace", "/login?next=/opportunities", "Opportunity discovery with direct Application Workspace handoff."],
  ["Application Workspace", "/login?next=/application-workspaces", "Owner-bound applications, tasks, documents, evidence, and support."],
  ["Notifications", "/login?next=/notifications", "Trusted notification producers, preferences, acknowledgement, and delivery state."],
] as const;

export default function PreviewPage() {
  return (
    <main style={page} data-testid="public-preview-gallery" data-visual-canon="PGPV-002">
      <CanonicalPublicNav />

      <section style={hero}>
        <p style={eyebrow}>Product review center</p>
        <h1 style={title}>Review the Playbook that is wired now.</h1>
        <p style={lead}>
          This gallery reflects the canonical product registry and current governed feature surfaces. Public pages open directly; personal records and authority-bearing workflows route through sign-in so private Scholar data is never exposed for demonstration.
        </p>
        <div style={statusRow}>
          <span style={statusPill}>{roleOptions.length} canonical roles</span>
          <span style={statusPill}>{productSurfaces.length} product surfaces</span>
          <span style={statusPill}>Production authority reconciled</span>
        </div>
      </section>

      <section style={section} aria-labelledby="role-review-title">
        <div style={sectionHead}>
          <div>
            <p style={eyebrow}>Role operating systems</p>
            <h2 id="role-review-title" style={sectionTitle}>Every canonical role, from one source of truth.</h2>
          </div>
          <Link href="/role-select" style={secondaryLink}>Open role selection →</Link>
        </div>

        <div style={grid} data-testid="canonical-role-preview-grid">
          {roleOptions.map((option, index) => (
            <article key={option.role} style={card} data-role={option.role}>
              <span style={number}>{String(index + 1).padStart(2, "0")}</span>
              <p style={cardEyebrow}>{option.role}</p>
              <h3 style={cardTitle}>{option.label}</h3>
              <p style={copy}>{option.description}</p>
              <Link href={option.href} style={button}>Open {option.label} OS →</Link>
            </article>
          ))}
        </div>
      </section>

      <section style={section} aria-labelledby="feature-review-title">
        <div style={sectionHead}>
          <div>
            <p style={eyebrow}>Canonical feature review</p>
            <h2 id="feature-review-title" style={sectionTitle}>Inspect the connected platform surfaces.</h2>
          </div>
        </div>

        <div style={grid} data-testid="canonical-feature-preview-grid">
          {productSurfaces.map(([label, href, description], index) => (
            <article key={href} style={card}>
              <span style={number}>{String(index + 1).padStart(2, "0")}</span>
              <h3 style={cardTitle}>{label}</h3>
              <p style={copy}>{description}</p>
              <Link href={href} style={button}>Open surface →</Link>
            </article>
          ))}
        </div>
      </section>

      <section style={note} aria-label="Compatibility route note">
        <strong>Canonical route note.</strong> College Admissions is reviewed at <code>/admissions-os</code>. The historical <code>/university-os</code> path remains redirect-only compatibility and is intentionally not presented as a separate Playbook role or operating system.
      </section>

      <CanonicalPublicFooter />
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", padding: "0 clamp(18px,4vw,54px) 64px", color: "#F8FAFC", background: "radial-gradient(circle at 88% 8%,rgba(249,115,22,.18),transparent 25rem),linear-gradient(145deg,#031023,#071B34 60%,#171425)" };
const hero: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "clamp(54px,9vw,110px) 0 48px" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#FF7A2F", fontSize: 11, fontWeight: 950, letterSpacing: ".18em", textTransform: "uppercase" };
const title: React.CSSProperties = { maxWidth: 1000, margin: "14px 0", fontFamily: "Anton, sans-serif", fontSize: "clamp(52px,8vw,104px)", fontWeight: 400, lineHeight: .9, textTransform: "uppercase" };
const lead: React.CSSProperties = { maxWidth: 860, color: "#C9D8E8", fontSize: 18, lineHeight: 1.65 };
const statusRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 26 };
const statusPill: React.CSSProperties = { padding: "9px 12px", border: "1px solid rgba(255,122,47,.42)", borderRadius: 999, background: "rgba(255,122,47,.1)", color: "#FFD1B7", fontSize: 12, fontWeight: 900, letterSpacing: ".05em", textTransform: "uppercase" };
const section: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 54px" };
const sectionHead: React.CSSProperties = { display: "flex", flexWrap: "wrap", alignItems: "end", justifyContent: "space-between", gap: 18, marginBottom: 20 };
const sectionTitle: React.CSSProperties = { maxWidth: 820, margin: "8px 0 0", fontSize: "clamp(28px,4vw,48px)", lineHeight: 1.03 };
const secondaryLink: React.CSSProperties = { color: "#FFB084", fontWeight: 900, textDecoration: "none" };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 };
const card: React.CSSProperties = { minHeight: 250, display: "flex", flexDirection: "column", padding: 24, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.14)", borderRadius: "24px 6px 24px 6px" };
const number: React.CSSProperties = { color: "#FF7A2F", fontWeight: 950, letterSpacing: ".12em" };
const cardEyebrow: React.CSSProperties = { margin: "18px 0 0", color: "#8FA9C4", fontSize: 10, fontWeight: 900, letterSpacing: ".13em", textTransform: "uppercase" };
const cardTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: 27, lineHeight: 1.05 };
const copy: React.CSSProperties = { flex: 1, color: "#B9C9DC", lineHeight: 1.6 };
const button: React.CSSProperties = { color: "#FFFFFF", fontWeight: 900, textDecoration: "none" };
const note: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 42px", padding: "18px 20px", border: "1px solid rgba(148,163,184,.28)", borderRadius: "18px 6px 18px 6px", background: "rgba(3,16,35,.72)", color: "#C9D8E8", lineHeight: 1.6 };
