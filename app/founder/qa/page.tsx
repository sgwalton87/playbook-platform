import { PLATFORM_QA_GATES } from "@/lib/platform/platformQaManifest";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

const evidenceLabel = {
  automated: "Automated evidence",
  operator: "Operator verification",
  "human-program": "Human program gate",
} as const;

export default function PlatformQaPage() {
  const automated = PLATFORM_QA_GATES.filter((gate) => gate.evidence === "automated").length;
  const operator = PLATFORM_QA_GATES.filter((gate) => gate.evidence === "operator").length;
  const humanProgram = PLATFORM_QA_GATES.filter((gate) => gate.evidence === "human-program").length;

  return (
    <PlaybookPage>
      <div data-testid="phase-15-platform-qa" data-phase-15-gates={PLATFORM_QA_GATES.length}>
        <PlaybookHero
          eyebrow="Founder Command Center · Phase 15"
          title="Platform QA and launch certification"
          subtitle="Twenty-four release-blocking gates define the final evidence required before Playbook may move from build completion into controlled launch. Automated evidence never substitutes for role journey, accessibility, or human launch validation."
        >
          <div style={actions}>
            <PlaybookButton href="/founder">Founder Command Center</PlaybookButton>
            <PlaybookButton href="/studio/beta-34-audit" variant="secondary">Open Platform Audit</PlaybookButton>
          </div>
        </PlaybookHero>

        <PlaybookMetrics>
          <PlaybookMetric label="Release-blocking gates" value={String(PLATFORM_QA_GATES.length)} />
          <PlaybookMetric label="Automated" value={String(automated)} />
          <PlaybookMetric label="Operator verified" value={String(operator)} />
          <PlaybookMetric label="Human program gates" value={String(humanProgram)} />
        </PlaybookMetrics>

        <section style={policyPanel}>
          <PlaybookPill>Fail closed</PlaybookPill>
          <h2 style={policyTitle}>A green build is necessary. It is not the same as launch approval.</h2>
          <p style={policyCopy}>Production build, security, and RLS certification can be automated. Role journeys, device experience, accessibility, soft launch, beta feedback, and final launch review require explicit evidence from the responsible human or operator workflow.</p>
        </section>

        <PlaybookGrid min={320}>
          {PLATFORM_QA_GATES.map((gate) => (
            <PlaybookCard key={gate.id} eyebrow={`${gate.id} · ${gate.category}`} title={gate.title}>
              <div style={pillRow}><PlaybookPill>{evidenceLabel[gate.evidence]}</PlaybookPill><PlaybookPill>Release blocking</PlaybookPill></div>
              <p style={body}>{gate.description}</p>
            </PlaybookCard>
          ))}
        </PlaybookGrid>
      </div>
    </PlaybookPage>
  );
}

const actions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 };
const policyPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const policyTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const policyCopy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.65 };
const pillRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 };
const body: React.CSSProperties = { color: "#52657B", lineHeight: 1.65, margin: 0 };
