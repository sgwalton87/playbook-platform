import { describe, expect, it } from "vitest";
import {
  attachMessageToSharedAction,
  buildConversationMessage,
  conversationFromInboundMail,
  getDemoConversations,
} from "@/lib/messages";
import InboxV2 from "@/components/messages/InboxV2";

describe("Inbox v2", () => {
  it("builds conversations", () => {
    expect(getDemoConversations().length).toBeGreaterThan(0);
  });

  it("builds conversation message", () => {
    const msg = buildConversationMessage({
      conversationId: "thread-1",
      senderRole: "mentor",
      senderName: "Coach",
      body: "Let's practice.",
    });

    expect(msg.body).toContain("practice");
  });

  it("attaches message to shared action", () => {
    expect(
      attachMessageToSharedAction({
        messageId: "msg-1",
        actionId: "action-1",
      }).attached
    ).toBe(true);
  });

  it("creates conversation from inbound mail", () => {
    const result = conversationFromInboundMail({
      scholarId: "scholar-1",
      senderEmail: "family@example.com",
      senderRole: "family",
      subject: "FAFSA",
      body: "I uploaded the docs.",
    });

    expect(result.message.source).toBe("email");
  });

  it("component is defined", () => {
    expect(InboxV2).toBeTruthy();
  });
});
