import { describe, expect, it } from "vitest";
import {
  buildEmailVerificationCallbackUrl,
  EMAIL_VERIFICATION_RESEND_ERROR_MESSAGE,
  getEmailVerificationOtpType,
  hasVerifiedEmail,
  isResendableEmail,
  maskEmail,
} from "@/lib/auth/emailVerification";

describe("email verification contract", () => {
  it("accepts only confirmation OTP types handled by this route", () => {
    expect(getEmailVerificationOtpType("signup")).toBe("signup");
    expect(getEmailVerificationOtpType("email")).toBe("email");
    expect(getEmailVerificationOtpType("recovery")).toBeNull();
    expect(getEmailVerificationOtpType(null)).toBeNull();
  });

  it("requires durable provider confirmation before granting verified authority", () => {
    expect(hasVerifiedEmail({ email_confirmed_at: "2026-08-09T12:00:00.000Z" })).toBe(true);
    expect(hasVerifiedEmail({ email_confirmed_at: undefined })).toBe(false);
  });

  it("validates resend targets and masks the displayed address", () => {
    expect(isResendableEmail("scholar@example.org")).toBe(true);
    expect(isResendableEmail("your email")).toBe(false);
    expect(maskEmail("scholar@example.org")).toBe("sc•••••@example.org");
  });

  it("uses the canonical callback and non-enumerating resend copy", () => {
    expect(buildEmailVerificationCallbackUrl("https://playbook.test")).toBe(
      "https://playbook.test/auth/callback"
    );
    expect(EMAIL_VERIFICATION_RESEND_ERROR_MESSAGE).not.toMatch(/supabase|account|registered|user/i);
  });
});
