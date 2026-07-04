import { describe, expect, it } from "vitest";
import {
  buildInviteLoginPath,
  buildInviteSignupPath,
  getInviteRedirectPath,
  shouldResumeInvite,
} from "@/lib/invite-auth";

describe("Invite Auth Handoff", () => {
  it("builds invite login and signup paths", () => {
    expect(buildInviteLoginPath("abc123456789")).toContain("invite=");
    expect(buildInviteSignupPath("abc123456789")).toContain("mode=signup");
  });

  it("builds invite redirect path", () => {
    expect(getInviteRedirectPath("token123456789")).toBe("/invite/token123456789");
  });

  it("detects resumable invite", () => {
    expect(shouldResumeInvite("token123456789")).toBe(true);
  });
});
