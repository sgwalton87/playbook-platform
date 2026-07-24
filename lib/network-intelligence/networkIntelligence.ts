export function buildNetworkIntelligence(input: {
  relationships?: LegacyValue[];
  messages?: LegacyValue[];
  actions?: LegacyValue[];
  invitations?: LegacyValue[];
} = {}) {
  const relationships = input.relationships || [];
  const messages = input.messages || [];
  const actions = input.actions || [];
  const invitations = input.invitations || [];

  const openActions = actions.filter((a) => a.status !== "complete");
  const completedActions = actions.filter((a) => a.status === "complete");
  const pendingInvites = invitations.filter((i) => i.status === "pending");

  const blockers = [
    ...openActions.map((a) => ({
      type: "shared_action",
      title: a.title,
      role: a.assigned_role,
      reason: `${a.assigned_role} has an incomplete shared action.`,
    })),
    ...pendingInvites.map((i) => ({
      type: "invitation",
      title: `Pending invitation for ${i.invitee_name || i.invitee_email}`,
      role: i.relationship,
      reason: "A support relationship has not been activated yet.",
    })),
  ];

  const healthScore = Math.max(
    0,
    Math.min(
      100,
      70 +
        relationships.length * 4 +
        completedActions.length * 5 -
        openActions.length * 6 -
        pendingInvites.length * 4
    )
  );

  return {
    healthScore,
    relationshipsCount: relationships.length,
    messagesCount: messages.length,
    actionsCount: actions.length,
    blockers,
    status:
      healthScore >= 85
        ? "strong"
        : healthScore >= 65
          ? "watch"
          : "needs_attention",
  };
}

export function buildCompassNetworkRecommendations(input: {
  role: string;
  intelligence: ReturnType<typeof buildNetworkIntelligence>;
}) {
  const { role, intelligence } = input;

  if (intelligence.blockers.length === 0) {
    return [
      {
        title: "Keep the network engaged",
        action: "Send one encouragement message or celebrate a completed milestone.",
        priority: "low",
      },
    ];
  }

  return intelligence.blockers.slice(0, 3).map((blocker) => ({
    title: `Resolve ${blocker.title}`,
    action:
      role === "family"
        ? "Help complete the family support task."
        : role === "mentor"
          ? "Coach the scholar through the next step."
          : role === "educator"
            ? "Verify or recommend the next academic action."
            : role === "district"
              ? "Monitor this blocker as part of access and equity tracking."
              : role === "university"
                ? "Use this signal for outreach readiness."
                : role === "employer"
                  ? "Review verified candidate readiness."
                  : "Complete the next best action.",
    priority: blocker.type === "shared_action" ? "high" : "medium",
  }));
}

export function getDemoNetworkIntelligence() {
  const relationships = [
    { relationship: "parent_guardian" },
    { relationship: "mentor" },
    { relationship: "educator" },
  ];

  const messages = [
    { sender_role: "family", body: "I can help tonight." },
    { sender_role: "mentor", body: "Mock interview this weekend." },
  ];

  const actions = [
    {
      title: "Upload support documents",
      assigned_role: "family",
      status: "open",
    },
    {
      title: "Schedule mock interview",
      assigned_role: "mentor",
      status: "complete",
    },
  ];

  const invitations = [
    {
      invitee_name: "University Outreach",
      relationship: "university_partner",
      status: "pending",
    },
  ];

  return buildNetworkIntelligence({
    relationships,
    messages,
    actions,
    invitations,
  });
}
