export type ConversationKind =
  | "direct"
  | "support_network"
  | "action_thread"
  | "mail_gateway";

export function buildConversation(input: {
  id: string;
  scholarId: string;
  title: string;
  kind: ConversationKind;
  participants: string[];
  unreadCount?: number;
  lastMessage?: string;
  updatedAt?: string;
}) {
  return {
    id: input.id,
    scholarId: input.scholarId,
    title: input.title,
    kind: input.kind,
    participants: input.participants,
    unreadCount: input.unreadCount || 0,
    lastMessage: input.lastMessage || "No messages yet.",
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

export function buildConversationMessage(input: {
  conversationId: string;
  senderRole: string;
  senderName: string;
  body: string;
  actionId?: string;
  source?: "app" | "email";
}) {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    conversationId: input.conversationId,
    senderRole: input.senderRole,
    senderName: input.senderName,
    body: input.body,
    actionId: input.actionId || null,
    source: input.source || "app",
    createdAt: new Date().toISOString(),
    read: false,
  };
}

export function getDemoConversations() {
  return [
    buildConversation({
      id: "support-network",
      scholarId: "scholar-maya",
      title: "Maya's Support Network",
      kind: "support_network",
      participants: ["Scholar", "Family", "Mentor", "Educator"],
      unreadCount: 3,
      lastMessage: "I can help gather the FAFSA documents tonight.",
    }),
    buildConversation({
      id: "family",
      scholarId: "scholar-maya",
      title: "Family Thread",
      kind: "direct",
      participants: ["Scholar", "Family"],
      unreadCount: 1,
      lastMessage: "Let's review the college night RSVP.",
    }),
    buildConversation({
      id: "mentor",
      scholarId: "scholar-maya",
      title: "Mentor Thread",
      kind: "direct",
      participants: ["Scholar", "Mentor"],
      unreadCount: 0,
      lastMessage: "Mock interview this weekend works.",
    }),
    buildConversation({
      id: "fafsa-action",
      scholarId: "scholar-maya",
      title: "FAFSA Shared Action",
      kind: "action_thread",
      participants: ["Scholar", "Family", "Educator"],
      unreadCount: 2,
      lastMessage: "Documents uploaded. Can someone verify?",
    }),
  ];
}

export function getDemoConversationMessages(conversationId = "support-network") {
  return [
    buildConversationMessage({
      conversationId,
      senderRole: "family",
      senderName: "Parent / Guardian",
      body: "I can help gather the FAFSA documents tonight.",
      actionId: "fafsa-docs",
    }),
    buildConversationMessage({
      conversationId,
      senderRole: "mentor",
      senderName: "Coach Taylor",
      body: "I can schedule a mock interview this weekend.",
      actionId: "mock-interview",
    }),
    buildConversationMessage({
      conversationId,
      senderRole: "educator",
      senderName: "Ms. Rivera",
      body: "I verified the Biology evidence.",
      source: "app",
    }),
  ];
}

export function attachMessageToSharedAction(input: {
  messageId: string;
  actionId: string;
}) {
  return {
    messageId: input.messageId,
    actionId: input.actionId,
    attached: true,
  };
}

export function conversationFromInboundMail(input: {
  scholarId: string;
  senderEmail: string;
  senderRole: string;
  subject: string;
  body: string;
}) {
  const conversationId = `mail-${input.senderRole}-${input.scholarId}`;

  return {
    conversation: buildConversation({
      id: conversationId,
      scholarId: input.scholarId,
      title: input.subject || `${input.senderRole} email reply`,
      kind: "mail_gateway",
      participants: ["Scholar", input.senderRole],
      unreadCount: 1,
      lastMessage: input.body,
    }),
    message: buildConversationMessage({
      conversationId,
      senderRole: input.senderRole,
      senderName: input.senderEmail,
      body: input.body,
      source: "email",
    }),
  };
}
