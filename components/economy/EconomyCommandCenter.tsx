"use client";

import { getRoleTour, getTourProgress, getContextualHelp } from "@/lib/guided-experience";
import { buildRewardPolicyDecision, shouldRewardMessage } from "@/lib/economy-integrity";
import { getDemoStoreCatalog, buildRedemptionTransaction } from "@/lib/store-economy";
import { buildBrandPartner, buildNILStoreCampaign, evaluateCampaignReadiness } from "@/lib/brand-partners";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

export default function EconomyCommandCenter() {
  const tour = getRoleTour("scholar_athlete");
  const tourProgress = getTourProgress({ role: "scholar_athlete", completedStepIds: ["dashboard", "messages"] });

  const policy = buildRewardPolicyDecision({
    scholarId: "scholar-record",
    eventType: "application.ready",
    sourceId: "app-1",
    alreadyProcessedKeys: [],
  });

  const products = getDemoStoreCatalog();
  const redemption = buildRedemptionTransaction({
    scholarId: "scholar-record",
    productId: products[0].id,
    coinPrice: products[0].coinPrice,
    currentBalance: 900,
  });

  const partner = buildBrandPartner({
    id: "partner-athletics",
    name: "Athletic Brand Partner",
    category: "athletics",
  });

  const campaign = buildNILStoreCampaign({
    id: "campaign-1",
    partnerId: partner.id,
    storeProductId: products[0].id,
    athleteId: "athlete-record",
    deliverables: ["Product feature", "Training reflection"],
  });

  const campaignReadiness = evaluateCampaignReadiness({
    status: "approved",
    deliverables: campaign.deliverables,
    disclosureApproved: true,
    athleteApproved: true,
  });

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Beta 3.4 Economy Arc"
        title="Guided experience, rewards, store, brand partners, and NIL commerce."
        subtitle="Playbook now has the foundation for role tours, economy integrity, store redemption, fulfillment, brand partners, and athlete campaign workflows."
      />

      <PlaybookMetrics>
        <PlaybookMetric label="Tour Progress" value={`${tourProgress}%`} />
        <PlaybookMetric label="Reward Policy" value={policy.allowed ? "Allowed" : "Blocked"} />
        <PlaybookMetric label="Store Items" value={String(products.length)} />
        <PlaybookMetric label="Campaign Ready" value={campaignReadiness.ready ? "Yes" : "No"} />
      </PlaybookMetrics>

      <PlaybookGrid>
        <PlaybookCard eyebrow="Guided Experience" title="Scholar-Athlete Tour">
          {tour.map((step) => <p key={step.id} style={body}>✓ {step.title}</p>)}
          <PlaybookPill>{getContextualHelp("/scholar-athlete-os")}</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Economy Integrity" title="Reward policy engine">
          <p style={body}>{policy.reason}</p>
          <p style={body}>Message reward allowed: {String(shouldRewardMessage({ messageCountToday: 2 }))}</p>
          <PlaybookPill>{policy.key}</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Store v2" title="Redemption economy">
          <p style={body}>Product: {products[0].name}</p>
          <p style={body}>Redemption: {redemption.ok ? "approved" : redemption.reason}</p>
          <PlaybookPill>{String(redemption.balanceAfter)} coins after</PlaybookPill>
        </PlaybookCard>

        <PlaybookCard eyebrow="Brand Partner + NIL" title={partner.name}>
          <p style={body}>Campaign: {campaign.status}</p>
          {campaignReadiness.blockers.map((blocker) => <p key={blocker} style={body}>○ {blocker}</p>)}
          <PlaybookPill>{campaignReadiness.ready ? "campaign ready" : "needs review"}</PlaybookPill>
        </PlaybookCard>
      </PlaybookGrid>
    </PlaybookPage>
  );
}

const body: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
};
