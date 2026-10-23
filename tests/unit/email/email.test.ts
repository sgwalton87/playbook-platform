import { describe, expect, it } from "vitest";
import { buildSupportInvitationEmail, buildScholarInvitationReceipt, getEmailSender, playbookEmails } from "@/lib/email";

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
    expect(email.html).toContain("Review my invitation");
    expect(email.html).toContain("THE PLAYBOOK");
    expect(email.html).toContain("background:#081d39");
  });
  it("escapes user-submitted text and includes a code in both emails", () => {
    const input = { inviteeName: "<Test>", scholarName: "Coach & Scholar", relationship: "parent_guardian" as const,
      url: "https://playbook.test/invite/abc", inviteCode: "ABC123XYZ789" };
    const invitation = buildSupportInvitationEmail(input);
    const receipt = buildScholarInvitationReceipt({ ...input, inviteeEmail: "invited@example.com" });
    expect(invitation.html).toContain("&lt;Test&gt;");
    expect(invitation.html).toContain("Coach &amp; Scholar");
    expect(invitation.html).toContain("ABC123XYZ789");
    expect(receipt.html).toContain("ABC123XYZ789");
    expect(receipt.subject).toContain("Invitation created");
  });
});
