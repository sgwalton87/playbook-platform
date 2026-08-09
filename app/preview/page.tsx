import Link from "next/link";
import CanonicalPublicNav from "@/components/public/CanonicalPublicNav";

const previews = [
  ["Public landing", "/", "The public Playbook entry and canonical brand story."],
  ["Public newsfeed", "/news", "Community stories intentionally published for public viewing."],
  ["Choose your role", "/role-select", "Fourteen current onboarding pathways in one role-aware entry."],
  ["Scholar-Athlete OS", "/scholar-athlete-os", "Academics, eligibility, recruiting, NIL, money, and support."],
  ["Academic Readiness", "/academic-readiness", "Evidence → intelligence → action → support."],
  ["Athlete Abroad OS", "/athlete-abroad-os", "Academic, athletic, travel, contract, and safety readiness."],
  ["Brand Partner OS", "/brand-partner-os", "Responsible opportunity, NIL, learning, and applications."],
  ["Family OS", "/family-os", "Consent-based family support with honest empty states."],
  ["Mentor OS", "/mentor-os", "Authorized mentorship, check-ins, messages, and shared actions."],
  ["Educator OS", "/educator-os", "Institution-scoped evidence, readiness, and intervention."],
  ["District OS", "/district-os", "Governed cohort and equity foundations."],
  ["Employer OS", "/employer-os", "Responsible opportunities and permissioned applications."],
  ["University OS", "/university-os", "Consent-based institutional pathways and outreach."],
  ["Courses", "/login?next=/courses", "Sign in to protect personal progress, certificates, rewards, and learning records."],
] as const;

export default function PreviewPage() {
  return (
    <main style={page} data-testid="public-preview-gallery" data-visual-canon="PGPV-001">
      <CanonicalPublicNav />
      <section style={hero}>
        <p style={eyebrow}>Live product recovery</p>
        <h1 style={title}>Explore the Playbook we are actually building.</h1>
        <p style={lead}>These are read-only preview surfaces. Empty metrics are intentional until authenticated records and permissions are connected; no fictional student data is presented as live.</p>
      </section>
      <section style={grid} aria-label="Available Playbook previews">
        {previews.map(([label, href, description], index) => (
          <article key={href} style={card}>
            <span style={number}>{String(index + 1).padStart(2, "0")}</span>
            <h2 style={cardTitle}>{label}</h2>
            <p style={copy}>{description}</p>
            <Link href={href} style={button}>Open preview →</Link>
          </article>
        ))}
      </section>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", padding: "0 clamp(18px,4vw,54px) 64px", color: "#F8FAFC", background: "radial-gradient(circle at 88% 8%,rgba(249,115,22,.18),transparent 25rem),linear-gradient(145deg,#031023,#071B34 60%,#171425)" };
const hero: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "clamp(54px,9vw,110px) 0 48px" };
const eyebrow: React.CSSProperties = { color: "#FF7A2F", fontSize: 11, fontWeight: 950, letterSpacing: ".18em", textTransform: "uppercase" };
const title: React.CSSProperties = { maxWidth: 950, margin: "14px 0", fontFamily: "Anton, sans-serif", fontSize: "clamp(52px,8vw,104px)", fontWeight: 400, lineHeight: .9, textTransform: "uppercase" };
const lead: React.CSSProperties = { maxWidth: 800, color: "#C9D8E8", fontSize: 18, lineHeight: 1.65 };
const grid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 };
const card: React.CSSProperties = { minHeight: 250, display: "flex", flexDirection: "column", padding: 24, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.14)", borderRadius: "24px 6px 24px 6px" };
const number: React.CSSProperties = { color: "#FF7A2F", fontWeight: 950, letterSpacing: ".12em" };
const cardTitle: React.CSSProperties = { margin: "18px 0 8px", fontSize: 27, lineHeight: 1.05 };
const copy: React.CSSProperties = { flex: 1, color: "#B9C9DC", lineHeight: 1.6 };
const button: React.CSSProperties = { color: "#FFFFFF", fontWeight: 900, textDecoration: "none" };
