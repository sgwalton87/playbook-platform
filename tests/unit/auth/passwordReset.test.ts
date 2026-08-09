import { describe, expect, it } from "vitest";
import {
  buildPasswordResetRedirect,
  getPasswordResetErrorMessage,
  getPasswordResetRequestMessage,
  isValidResetPassword,
} from "@/lib/auth/passwordReset";

describe("password reset", () => {
  it("builds the canonical recovery redirect", () => {
    expect(buildPasswordResetRedirect("https://playbook.test/")).toBe("https://playbook.test/reset-password");
  });

  it("requires a matching password of at least eight characters", () => {
    expect(isValidResetPassword("short", "short")).toBe(false);
    expect(isValidResetPassword("new-secure-password", "different-password")).toBe(false);
    expect(isValidResetPassword("new-secure-password", "new-secure-password")).toBe(true);
  });

  it("uses non-enumerating recovery messages", () => {
    expect(getPasswordResetRequestMessage()).not.toMatch(/not found|exists|registered/i);
    expect(getPasswordResetErrorMessage()).not.toMatch(/token|session|user/i);
  });
});
