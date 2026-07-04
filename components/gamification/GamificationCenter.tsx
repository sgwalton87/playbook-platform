"use client";

import { getCoinBalance, getDemoCoinLedger } from "@/lib/gamification";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage } from "@/components/ui";

export default function GamificationCenter() {
  const ledger = getDemoCoinLedger();
  const balance = getCoinBalance(ledger);

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Gamification v2" title="Earn coins by building your future." subtitle="Courses, goals, evidence, support actions, milestones, invitations, and messages can reward progress." />
      <PlaybookMetrics>
        <PlaybookMetric label="Coin Balance" value={String(balance)} />
        <PlaybookMetric label="Reward Events" value={String(ledger.length)} />
      </PlaybookMetrics>
      <PlaybookGrid>
        {ledger.map((entry) => (
          <PlaybookCard key={`${entry.action}-${entry.createdAt}`} eyebrow="Coin Award" title={entry.action.replaceAll(".", " ")}>
            <p style={{ color: "#64748B" }}>+{entry.coins} coins</p>
          </PlaybookCard>
        ))}
      </PlaybookGrid>
    </PlaybookPage>
  );
}
