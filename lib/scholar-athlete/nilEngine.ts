export type NILDealStage =
  | "lead"
  | "conversation"
  | "negotiation"
  | "review"
  | "signed"
  | "active"
  | "completed"
  | "declined";

export type NILDeal = {
  id: string;
  brandName: string;
  opportunityTitle: string;
  stage: NILDealStage;
  compensationType?: "cash" | "product" | "equity" | "mixed";
  compensationAmount?: number;
  deliverables: Array<{
    id: string;
    label: string;
    dueDate?: string;
    completed: boolean;
  }>;
  contractStatus:
    | "not_received"
    | "received"
    | "under_review"
    | "approved"
    | "signed";
  disclosureStatus:
    | "not_started"
    | "pending"
    | "submitted"
    | "approved";
  paymentStatus:
    | "not_due"
    | "due"
    | "partial"
    | "paid";
};

export function evaluateNILDealReadiness(deal: NILDeal) {
  const warnings: string[] = [];

  if (
    ["signed", "active"].includes(deal.stage) &&
    deal.contractStatus !== "signed"
  ) {
    warnings.push("Deal is active without a signed contract record.");
  }

  if (
    deal.stage === "active" &&
    !["submitted", "approved"].includes(deal.disclosureStatus)
  ) {
    warnings.push("Disclosure workflow needs attention.");
  }

  const overdueDeliverables = deal.deliverables.filter(
    (item) =>
      !item.completed &&
      item.dueDate &&
      new Date(item.dueDate).getTime() < Date.now()
  );

  if (overdueDeliverables.length) {
    warnings.push(
      `${overdueDeliverables.length} deliverable(s) need attention.`
    );
  }

  return {
    dealId: deal.id,
    ready: warnings.length === 0,
    warnings,
    overdueDeliverables,
  };
}

export function getNILPortfolioSummary(deals: NILDeal[]) {
  const cashValue = deals.reduce(
    (sum, deal) => sum + (deal.compensationAmount || 0),
    0
  );

  return {
    totalDeals: deals.length,
    activeDeals: deals.filter((deal) => deal.stage === "active").length,
    completedDeals: deals.filter(
      (deal) => deal.stage === "completed"
    ).length,
    trackedCashValue: cashValue,
  };
}
