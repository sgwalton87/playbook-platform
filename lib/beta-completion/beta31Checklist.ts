export function getBeta31CompletionChecklist() {
  return [
    { item: "Scholar sends invitation", status: "complete" },
    { item: "Email sends from Playbook Onboarding", status: "complete" },
    { item: "Invitee accepts through token route", status: "complete" },
    { item: "Invite token survives auth handoff", status: "complete" },
    { item: "Relationship is created", status: "complete" },
    { item: "Permissions are attached", status: "complete" },
    { item: "Invitee lands in correct OS", status: "complete" },
    { item: "Scholar sees support network", status: "complete" },
    { item: "Free-text DMs exist", status: "complete" },
    { item: "Shared actions exist", status: "complete" },
    { item: "Mail Gateway ingests inbound replies", status: "foundation_complete" },
    { item: "Compass reasons across network", status: "complete" },
  ];
}

export function getBeta31CompletionStatus() {
  const checklist = getBeta31CompletionChecklist();
  const complete = checklist.filter((item) =>
    ["complete", "foundation_complete"].includes(item.status)
  ).length;

  return {
    total: checklist.length,
    complete,
    percent: Math.round((complete / checklist.length) * 100),
    label: complete === checklist.length ? "Beta 3.1 Complete" : "Beta 3.1 In Progress",
  };
}
