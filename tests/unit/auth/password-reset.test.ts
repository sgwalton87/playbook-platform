import { describe, expect, it } from "vitest";
import {
  buildPasswordResetRedirectUrl,
  PASSWORD_RESET_REQUEST_MESSAGE,
  validateResetPasswords,
} from "@/lib/auth/passwordReset";

describe("password reset security contract", () => {
  it("builds a same-origin recovery destination", () => {
    expect(buildPasswordResetRedirectUrl("https://playbook.example")).toBe(
      "https://playbook.example/reset-password"
    );
  });

  it("requires a strong-enough matching password", () => {
    expect(validateResetPasswords("short", "short")).toMatch(/at least 8/i);
    expect(validateResetPasswords("long-enough", "different")).toMatch(/do not match/i);
    expect(validateResetPasswords("long-enough", "long-enough")).toBeNull();
  });

  it("does not reveal whether an email belongs to an account", () => {
    expect(PASSWORD_RESET_REQUEST_MESSAGE).not.toMatch(/account exists|not found|registered user/i);
  });
});
