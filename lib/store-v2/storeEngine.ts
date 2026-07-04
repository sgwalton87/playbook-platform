export type StoreItemCategory =
  | "athletic_training"
  | "apparel"
  | "upward_mobility"
  | "school_supplies"
  | "financial_literacy";

export function getStoreItems() {
  return [
    { id: "training-kit", name: "Athletic Training Kit", category: "athletic_training", coinPrice: 500, partner: "Brand Partner", inventory: 12 },
    { id: "playbook-hoodie", name: "Playbook Scholar Hoodie", category: "apparel", coinPrice: 350, partner: "Playbook", inventory: 25 },
    { id: "interview-kit", name: "Career Interview Kit", category: "upward_mobility", coinPrice: 300, partner: "Community Partner", inventory: 15 },
    { id: "budget-workbook", name: "Financial Literacy Workbook", category: "financial_literacy", coinPrice: 150, partner: "Playbook", inventory: 100 },
  ] as const;
}

export function canRedeem(input: { balance: number; coinPrice: number; inventory: number }) {
  return input.balance >= input.coinPrice && input.inventory > 0;
}

export function buildRedemption(input: {
  scholarId: string;
  itemId: string;
  coinPrice: number;
}) {
  return {
    scholarId: input.scholarId,
    itemId: input.itemId,
    coinsSpent: input.coinPrice,
    status: "pending_fulfillment",
    createdAt: new Date().toISOString(),
  };
}

export function connectNILPromotion(input: {
  athleteId: string;
  brandPartner: string;
  storeItemId: string;
  dealId?: string;
}) {
  return {
    athleteId: input.athleteId,
    brandPartner: input.brandPartner,
    storeItemId: input.storeItemId,
    dealId: input.dealId || null,
    status: "eligible_for_campaign_review",
  };
}
