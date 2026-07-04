import { conversationFromInboundMail } from "./conversationEngine";

export function bridgeMailToConversation(input: {
  scholarId: string;
  senderEmail: string;
  senderRole: string;
  subject: string;
  body: string;
}) {
  const result = conversationFromInboundMail(input);

  return {
    conversation: result.conversation,
    message: result.message,
    normalized: true,
  };
}
