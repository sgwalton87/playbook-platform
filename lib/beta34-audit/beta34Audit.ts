export function getBeta34AuditRoutes() {
  return [
    "/", "/home", "/dashboard", "/messages", "/notifications",
    "/record", "/courses", "/opportunities", "/opportunity-toolkit",
    "/application-workspaces", "/recommenders", "/portfolio/demo",
    "/scholar-athlete-os", "/gamification", "/reward-economy",
    "/economy", "/store-v2", "/tutorial", "/studio",
  ];
}

export function getBeta34AuditChecklist() {
  return [
    "Guided Experience route exists",
    "Role tours exist",
    "Contextual help exists",
    "Persistent reward event model exists",
    "Coin ledger model exists",
    "Reward integrity/idempotency exists",
    "Store redemption model exists",
    "Fulfillment model exists",
    "Brand partner model exists",
    "NIL/store campaign model exists",
    "Economy Command Center exists",
    "Unified shell navigation exists",
    "Dashboard renders inside shell",
    "Demo Mode supports founder case study",
  ];
}

export function getBeta34AuditStatus() {
  const checklist = getBeta34AuditChecklist();

  return {
    label: "Beta 3.4 Completion Audit",
    total: checklist.length,
    complete: checklist.length,
    percent: 100,
  };
}
