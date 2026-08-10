"use client";

import { canRedeem, connectNILPromotion, getStoreItems } from "@/lib/store-v2";
import { getCoinBalance } from "@/lib/gamification";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

export default function StoreV2() {
  const balance = getCoinBalance();
  const items = getStoreItems();
  const campaign = connectNILPromotion({
    athleteId: "athlete-record",
    brandPartner: "Brand Partner",
    storeItemId: "training-kit",
  });

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Playbook Store v2" title="Redeem earned coins for real upward mobility." subtitle="Brand-partner products, athletic tools, training gear, apparel, learning resources, and future NIL-connected campaigns." />
      <PlaybookMetrics>
        <PlaybookMetric label="Coin Balance" value={String(balance)} />
        <PlaybookMetric label="Store Items" value={String(items.length)} />
        <PlaybookMetric label="NIL Campaign" value={campaign.status.replaceAll("_", " ")} />
      </PlaybookMetrics>
      <PlaybookGrid>
        {items.map((item) => {
          const redeemable = canRedeem({ balance, coinPrice: item.coinPrice, inventory: item.inventory });
          return (
            <PlaybookCard key={item.id} eyebrow={item.category.replaceAll("_", " ")} title={item.name}>
              <p style={{ color: "#64748B", lineHeight: 1.6 }}>Partner: {item.partner}</p>
              <p style={{ color: "#0F172A", fontWeight: 900 }}>{item.coinPrice} coins</p>
              <PlaybookPill>{redeemable ? "redeemable" : "earn more coins"}</PlaybookPill>
            </PlaybookCard>
          );
        })}
      </PlaybookGrid>
    </PlaybookPage>
  );
}
