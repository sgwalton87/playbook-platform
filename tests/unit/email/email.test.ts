import { describe, expect, it } from "vitest";
import { buildSupportInvitationEmail, getEmailSender, playbookEmails } from "@/lib/email";

describe("Playbook Email System", () => {
  it("uses onboarding sender", () => {
    expect(getEmailSender("onboarding")).toContain("onboarding@playbookseriesinc.org");
  });

  it("has support email", () => {
    expect(playbookEmails.support).toContain("support@playbookseriesinc.org");
  });

  it("builds support invitation email", () => {
    const email = buildSupportInvitationEmail({
      inviteeName: "Coach Taylor",
      scholarName: "Maya",
      relationship: "mentor",
      url: "https://playbook.test/invite/abc",
    });

    expect(email.subject).toContain("Maya");
    expect(email.text).toContain("/invite/abc");
    expect(email.html).toContain("Accept Invitation");
  });
});
