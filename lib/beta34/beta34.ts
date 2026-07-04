export function getBeta34Pillars() {
  return [
    "First-login tutorial",
    "Role-specific guided tours",
    "Contextual help",
    "Persistent coin ledger",
    "Platform-wide reward events",
    "Store v2 fulfillment",
    "Brand partner catalog",
    "NIL/store campaign workflow",
  ];
}

export function getBeta34Status() {
  const pillars = getBeta34Pillars();

  return {
    phase: "Playbook OS Beta 3.4",
    name: "Guided Experience + Gamification Economy",
    status: "foundation_started",
    pillars,
  };
}
