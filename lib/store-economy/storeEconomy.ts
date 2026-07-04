export type StoreProductCategory =
  | "athletic_training"
  | "apparel"
  | "academic_tools"
  | "career_tools"
  | "financial_literacy"
  | "wellness";

export type FulfillmentStatus =
  | "pending"
  | "approved"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export function buildStoreProduct(input: {
  id: string;
  name: string;
  category: StoreProductCategory;
  coinPrice: number;
  partnerId?: string;
  inventory: number;
  requiresApproval?: boolean;
}) {
  return {
    ...input,
    partnerId: input.partnerId || null,
    requiresApproval: input.requiresApproval || false,
    active: true,
  };
}

export function buildRedemptionTransaction(input: {
  scholarId: string;
  productId: string;
  coinPrice: number;
  currentBalance: number;
}) {
  if (input.currentBalance < input.coinPrice) {
    return {
      ok: false,
      reason: "Insufficient coin balance.",
      balanceAfter: input.currentBalance,
    };
  }

  return {
    ok: true,
    scholarId: input.scholarId,
    productId: input.productId,
    coinsSpent: input.coinPrice,
    balanceAfter: input.currentBalance - input.coinPrice,
    fulfillmentStatus: "pending" as FulfillmentStatus,
  };
}

export function updateFulfillmentStatus(input: {
  redemptionId: string;
  status: FulfillmentStatus;
  note?: string;
}) {
  return {
    redemptionId: input.redemptionId,
    status: input.status,
    note: input.note || null,
    updatedAt: new Date().toISOString(),
  };
}

export function getDemoStoreCatalog() {
  return [
    buildStoreProduct({ id: "training-kit", name: "Athletic Training Kit", category: "athletic_training", coinPrice: 500, partnerId: "partner-athletics", inventory: 20, requiresApproval: true }),
    buildStoreProduct({ id: "scholar-hoodie", name: "Playbook Scholar Hoodie", category: "apparel", coinPrice: 350, partnerId: "partner-apparel", inventory: 50 }),
    buildStoreProduct({ id: "interview-kit", name: "Interview Readiness Kit", category: "career_tools", coinPrice: 300, partnerId: "partner-career", inventory: 30 }),
    buildStoreProduct({ id: "budget-kit", name: "Financial Literacy Kit", category: "financial_literacy", coinPrice: 150, partnerId: "playbook", inventory: 100 }),
  ];
}
