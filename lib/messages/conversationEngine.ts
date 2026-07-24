export type ConversationKind =
  | "direct"
  | "support_network"
  | "action_thread"
  | "mail_gateway";

export type Conversation = ReturnType<typeof buildConversation>;

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

export function getDemoConversations(): Conversation[] {
  return [];
}

export function getDemoConversationMessages(): ReturnType<typeof buildConversationMessage>[] {
  return [];
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
