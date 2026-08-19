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
  PlaybookPill,
} from "@/components/ui";

const pathways = [
  { label: "Go Abroad", title: "Build an international opportunity plan", body: "Use the shared Opportunity and Application services to research programs, preserve deadlines, and turn a real opportunity into an accountable plan.", href: "/opportunities", action: "Explore global opportunities" },
  { label: "Living Abroad", title: "Prepare for everyday life overseas", body: "Use the canonical Athletes Abroad learning path for culture, communication, travel documents, safety, budgeting, and transition planning.", href: "/courses/athletes-abroad-global-hub", action: "Open living-abroad curriculum" },
  { label: "Life After Sport", title: "Keep the future bigger than the next contract", body: "Connect education, transferable skills, career planning, financial readiness, and support relationships through existing Playbook services.", href: "/career", action: "Open career planning" },
  { label: "Global Athlete Profile", title: "Present one verified athlete identity", body: "Your global profile consumes the canonical Scholar-Athlete Record, including film, measurements, achievements, academics, and verified evidence.", href: "/profile", action: "Open athlete profile" },
  { label: "Career History", title: "Preserve the full playing journey", body: "Use the Scholar Record timeline and living evidence model rather than creating a second international-career database.", href: "/transcript", action: "Review canonical record" },
  { label: "Country Channels", title: "Find people by destination", body: "Use the shared Network and Messaging services to connect with trusted people around destination-specific conversations without duplicating community infrastructure.", href: "/connections", action: "Open network" },
  { label: "Sport Channels", title: "Connect around the game", body: "Use shared Network and Messaging capabilities for sport-specific communities, coaches, peers, alumni, and mentors.", href: "/messages", action: "Open sport conversations" },
  { label: "Global Locker Room", title: "Stay connected with your people", body: "The locker room is a role-aware experience composed from canonical messaging, connections, moderation, blocking, reporting, and meeting-link services.", href: "/messages", action: "Enter Global Locker Room" },
  { label: "Summit Integration", title: "Bring global athletes into shared events", body: "Athletes Abroad summits remain a shared Event type so RSVP, calendar, reminders, check-in, networking, and replay behavior stays canonical.", href: "/events", action: "Browse summit events" },
  { label: "Summit Meetings", title: "Turn introductions into accountable follow-up", body: "Coordinate summit follow-ups with shared Event and Messaging services rather than introducing a parallel meeting system.", href: "/messages", action: "Coordinate summit meetings" },
  { label: "Meetups", title: "Find safe community gatherings", body: "Discover and manage community meetups through the shared Events service with the same RSVP, reminders, and check-in boundaries used platform-wide.", href: "/events", action: "Browse meetups" },
  { label: "Housing Resources", title: "Plan where you will live", body: "Housing preparation stays educational and support-oriented until a verified external resource is available; use the global course and trusted support network for planning.", href: "/courses/athletes-abroad-global-hub", action: "Open housing readiness" },
  { label: "Healthcare Resources", title: "Prepare for health and coverage abroad", body: "Use the global readiness curriculum and trusted support network to prepare questions about coverage, providers, documentation, and emergency planning.", href: "/support-network", action: "Open support network" },
  { label: "Tax Resources", title: "Understand cross-border money questions", body: "Use shared Financial Intelligence for education and preparation. Playbook does not represent general guidance as individualized tax advice.", href: "/financial-intelligence", action: "Open financial readiness" },
  { label: "Contract Resources", title: "Read the complete offer before you sign", body: "Contract preparation combines financial literacy, evidence, trusted support, and human review without allowing AI to approve legal or financial terms.", href: "/financial-intelligence", action: "Open contract readiness" },
  { label: "Alumni Network", title: "Learn from athletes who have already lived it", body: "Discover alumni and trusted peers through the shared Network service so relationships remain permissioned, searchable, and messageable across Playbook.", href: "/connections", action: "Explore alumni network" },
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
      <div data-testid="athlete-abroad-os" data-visual-canon="PGAA-001" data-phase-13-capabilities={pathways.length}>
        <PlaybookHero
          eyebrow="Athlete Abroad OS"
          title="Take your game global without leaving your future behind."
          subtitle="One international athlete experience composed from the same Scholar Record, Opportunity, Application, Events, Network, Messaging, Learning, Financial Intelligence, and support services used across Playbook."
        >
          <div style={actions}>
            <PlaybookButton href="/courses/athletes-abroad-global-hub">Start global readiness</PlaybookButton>
            <PlaybookButton href="/opportunities" variant="secondary">Explore opportunities</PlaybookButton>
            <PlaybookButton href="/connections" variant="secondary">Find your network</PlaybookButton>
          </div>
        </PlaybookHero>

        <section style={trustPanel}>
          <PlaybookPill>Scholar Record first</PlaybookPill>
          <h2 style={trustTitle}>International readiness extends your record. It does not create a second identity.</h2>
          <p style={trustCopy}>Academic history, athletic evidence, applications, events, relationships, learning progress, and financial-readiness work stay with their canonical owners. Athlete Abroad OS composes those services into one guided global journey.</p>
        </section>

        <PlaybookMetrics>
          <PlaybookMetric label="Phase 13 capabilities" value={String(pathways.length)} />
          <PlaybookMetric label="Canonical athlete record" value="1 shared record" />
          <PlaybookMetric label="Shared platform services" value="8+ composed" />
          <PlaybookMetric label="Consequential decisions" value="Human authority" />
        </PlaybookMetrics>

        <PlaybookGrid min={300}>
          {pathways.map((item) => (
            <PlaybookCard key={item.label} eyebrow={item.label} title={item.title}>
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
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const trustTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const trustCopy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.65 };
const body: React.CSSProperties = { color: "#52657B", lineHeight: 1.65, margin: "0 0 20px" };
