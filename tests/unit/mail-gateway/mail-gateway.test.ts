import { describe, expect, it } from "vitest";
import {
  classifyMailIntent,
  normalizeIncomingMail,
  routeMailToPlaybook,
} from "@/lib/mail-gateway";

describe("Hostinger Mail Gateway", () => {
  it("normalizes incoming mail", () => {
    const mail = normalizeIncomingMail({
      mailbox: "support",
      from: "Coach@Example.com",
      to: "support@playbookseriesinc.org",
      subject: "Question",
      text: "I have a question.",
    });

    expect(mail.senderEmail).toBe("coach@example.com");
  });

  it("classifies shared action update", () => {
    expect(classifyMailIntent("I uploaded the FAFSA docs")).toBe("shared_action_update");
  });

  it("routes mail to Playbook", () => {
    const routed = routeMailToPlaybook({
      mailbox: "onboarding",
      from: "family@example.com",
      to: "onboarding@playbookseriesinc.org",
      subject: "Invite",
      text: "Question about my invite",
    });

    expect(routed.routeTo).toBeTruthy();
  });
});
