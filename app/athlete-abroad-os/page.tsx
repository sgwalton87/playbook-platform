"use client";

import AthleteAbroadReadinessGate from "@/components/athlete-abroad/AthleteAbroadReadinessGate";
import { CanonicalRoleAuthorityGate } from "@/components/role-os/RoleAuthorityGate";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";

const pathway = [
  { label: "Academic passport", title: "Prepare records that can travel", body: "Organize transcripts, graduation evidence, eligibility context, and academic-equivalency needs.", href: "/transcript", action: "Open academic record" },
  { label: "Athlete portfolio", title: "Present verified athletic evidence", body: "Connect film, position, measurements, honors, references, and the story behind your development.", href: "/profile", action: "Build athlete profile" },
  { label: "Global discovery", title: "Explore countries and programs", body: "Research destinations, teams, academies, governing bodies, and responsible opportunity requirements.", href: "/opportunities", action: "Explore opportunities" },
  { label: "People", title: "Track trusted international contacts", body: "Keep coaches, scouts, agents, clubs, supporters, and follow-ups inside an accountable network.", href: "/support-network", action: "Open support network" },
  { label: "Money & contracts", title: "Understand the complete offer", body: "Prepare for housing, salary, travel, taxes, agent fees, contracts, and long-term financial decisions.", href: "/financial-intelligence", action: "Build financial readiness" },
  { label: "Culture & safety", title: "Prepare for life beyond the field", body: "Plan language, food, healthcare, housing, travel documents, safeguarding, and emergency support.", href: "/courses/athletes-abroad-global-hub", action: "Start global course" },
] as const;

export default function AthleteAbroadOSPage() {
  return (
    <CanonicalRoleAuthorityGate role="athlete-abroad">
      <AthleteAbroadReadinessGate>
        <AthleteAbroadWorkspace />
      </AthleteAbroadReadinessGate>
    </CanonicalRoleAuthorityGate>
  );
}

function AthleteAbroadWorkspace() {
  return (
    <PlaybookPage>
      <div data-testid="athlete-abroad-os" data-visual-canon="PGAA-001">
        <PlaybookHero
          eyebrow="Athlete Abroad OS"
          title="Take your game global without leaving your future behind."
          subtitle="A connected international pathway for academics, eligibility, recruiting, contracts, culture, safety, and the trusted people making the move with you."
        >
          <div style={actions}>
            <PlaybookButton href="/courses/athletes-abroad-global-hub">Start global readiness</PlaybookButton>
            <PlaybookButton href="/opportunities" variant="secondary">Explore opportunities</PlaybookButton>
          </div>
        </PlaybookHero>

        <PlaybookMetrics>
          <PlaybookMetric label="Verified destinations" value="0 connected" />
          <PlaybookMetric label="Program conversations" value="0 connected" />
          <PlaybookMetric label="Open document tasks" value="0 connected" />
          <PlaybookMetric label="Authorized contacts" value="0 connected" />
        </PlaybookMetrics>

        <PlaybookGrid min={300}>
          {pathway.map((item) => (
            <PlaybookCard key={item.href} eyebrow={item.label} title={item.title}>
              <p style={body}>{item.body}</p>
              <PlaybookButton href={item.href}>{item.action}</PlaybookButton>
            </PlaybookCard>
          ))}
        </PlaybookGrid>
      </div>
    </PlaybookPage>
  );
}

const actions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 };
const body: React.CSSProperties = { color: "#52657B", lineHeight: 1.65, margin: "0 0 20px" };
