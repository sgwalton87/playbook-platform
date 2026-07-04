export type MailGatewayChannel =
  | "onboarding"
  | "support"
  | "notifications"
  | "hello"
  | "noreply";

export interface IncomingMailEvent {
  mailbox: MailGatewayChannel;
  from: string;
  to: string;
  subject: string;
  text: string;
  messageId?: string;
}

export function normalizeIncomingMail(input: IncomingMailEvent) {
  return {
    id: input.messageId || `mail-${Date.now()}`,
    mailbox: input.mailbox,
    senderEmail: input.from.toLowerCase(),
    recipientEmail: input.to.toLowerCase(),
    subject: input.subject,
    body: input.text,
    receivedAt: new Date().toISOString(),
  };
}

export function classifyMailIntent(text: string) {
  const body = text.toLowerCase();

  if (body.includes("uploaded") || body.includes("complete") || body.includes("done")) {
    return "shared_action_update";
  }

  if (body.includes("help") || body.includes("question")) {
    return "support_request";
  }

  if (body.includes("accept") || body.includes("invite")) {
    return "invitation_question";
  }

  return "general_message";
}

export function routeMailToPlaybook(input: IncomingMailEvent) {
  const normalized = normalizeIncomingMail(input);
  const intent = classifyMailIntent(normalized.body);

  return {
    ...normalized,
    intent,
    routeTo: intent === "support_request" ? "support_queue" : "support_network_thread",
  };
}
