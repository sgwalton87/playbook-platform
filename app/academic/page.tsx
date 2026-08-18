import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

const academicCapabilities = [
  {
    eyebrow: "Transcript Intelligence",
    title: "Transcript · Parsing · A–G",
    body: "Upload private transcript evidence, review extracted coursework, confirm the record, and track UC/CSU A–G progress from the same canonical academic journey.",
    href: "/transcript",
    action: "Open Transcript",
    capabilities: ["Transcript Upload", "Transcript Parsing", "A-G Tracker"],
  },
  {
    eyebrow: "Financial Aid",
    title: "FAFSA Tracker",
    body: "Track FAFSA readiness, milestones, submission state, and next actions without storing unnecessary sensitive financial credentials.",
    href: "/fafsa",
    action: "Open FAFSA Tracker",
    capabilities: ["FAFSA Tracker"],
  },
  {
    eyebrow: "Opportunity",
    title: "Scholarships",
    body: "Discover scholarship opportunities through Playbook's governed opportunity catalog and move selected opportunities into application execution.",
    href: "/scholarships",
    action: "Explore Scholarships",
    capabilities: ["Scholarships"],
  },
  {
    eyebrow: "College Planning",
    title: "College Search",
    body: "Search the governed college catalog and maintain one private canonical list of schools you are considering.",
    href: "/college-search",
    action: "Search Colleges",
    capabilities: ["College Search"],
  },
  {
    eyebrow: "College Priorities",
    title: "Dream Schools",
    body: "Mark aspirational priorities without creating a duplicate school record or losing the source of the saved school.",
    href: "/dream-schools",
    action: "Open Dream Schools",
    capabilities: ["Dream Schools"],
  },
  {
    eyebrow: "College Priorities",
    title: "Top Schools",
    body: "Build an independent best-fit shortlist on the same college-list authority. A school can be both Dream and Top when that reflects your plan.",
    href: "/top-schools",
    action: "Open Top Schools",
    capabilities: ["Top Schools"],
  },
  {
    eyebrow: "Application Execution",
    title: "Applications · Deadlines",
    body: "Track real deadlines, checklist tasks, documents, readiness, and submission state inside the governed Application Workspace instead of duplicating an application tracker.",
    href: "/application-workspaces",
    action: "Open Applications",
    capabilities: ["Application Deadlines", "Application Tracker"],
  },
  {
    eyebrow: "Readiness",
    title: "Academic Readiness",
    body: "Turn canonical A–G evidence and active application work into explainable readiness, a next play, and a recorded user decision.",
    href: "/academic-readiness",
    action: "Review Readiness",
    capabilities: ["Academic Readiness"],
  },
  {
    eyebrow: "Guidance",
    title: "Compass Recommendations",
    body: "Use Playbook intelligence to interpret the same canonical record, explain the recommendation, and preserve your authority over the decision.",
    href: "/compass",
    action: "Open Compass",
    capabilities: ["Compass Recommendations"],
  },
] as const;

export default function AcademicPage() {
  const capabilityCount = academicCapabilities.reduce((total, item) => total + item.capabilities.length, 0);

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Academic OS · Phase 9"
        title="One academic journey. Every next play connected."
        subtitle="Transcript evidence, A–G readiness, financial-aid milestones, college priorities, applications, deadlines, and guidance all resolve to shared canonical Playbook services instead of competing trackers."
      >
        <PlaybookButton href="/academic-readiness">See my next academic play</PlaybookButton>
      </PlaybookHero>

      <PlaybookMetrics>
        <PlaybookMetric label="Phase 9 capabilities" value={String(capabilityCount)} />
        <PlaybookMetric label="Canonical journeys" value={String(academicCapabilities.length)} />
        <PlaybookMetric label="Architecture" value="Shared services" />
      </PlaybookMetrics>

      <section style={principleStyle} aria-label="Academic architecture principle">
        <PlaybookPill>Scholar Record first</PlaybookPill>
        <h2 style={principleTitleStyle}>Evidence enters once. The rest of Playbook activates it.</h2>
        <p style={principleCopyStyle}>
          Academic experiences consume or improve the Playbook Record. Transcript evidence feeds readiness; college priorities remain on one school list; application deadlines and status remain in one Application Workspace; Compass interprets those records without replacing them.
        </p>
      </section>

      <PlaybookGrid min={320}>
        {academicCapabilities.map((item) => (
          <PlaybookCard key={item.title} eyebrow={item.eyebrow} title={item.title}>
            <p style={copyStyle}>{item.body}</p>
            <div style={pillRowStyle}>
              {item.capabilities.map((capability) => <PlaybookPill key={capability}>{capability}</PlaybookPill>)}
            </div>
            <div style={actionStyle}>
              <PlaybookButton href={item.href}>{item.action}</PlaybookButton>
            </div>
          </PlaybookCard>
        ))}
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const principleStyle: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  padding: "clamp(22px,4vw,34px)",
  borderRadius: "8px 30px 8px 30px",
  background: "linear-gradient(120deg,#102A4A,#102238 58%,#2B1838)",
  color: "#F8FAFC",
};
const principleTitleStyle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(26px,4vw,40px)", lineHeight: 1.05 };
const principleCopyStyle: React.CSSProperties = { margin: 0, maxWidth: 900, color: "#C9D8E8", lineHeight: 1.65 };
const copyStyle: React.CSSProperties = { color: "#52657B", lineHeight: 1.65 };
const pillRowStyle: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 };
const actionStyle: React.CSSProperties = { marginTop: 18 };
