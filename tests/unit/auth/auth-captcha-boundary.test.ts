import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const login = readFileSync("app/login/page.tsx", "utf8");
const recovery = readFileSync("app/reset-password/page.tsx", "utf8");

describe("Production CAPTCHA enforcement on authentication routes", () => {
  it("requires an hCaptcha solution for password login and forwards it", () => {
    expect(login).toContain("if (!captchaReady)");
    expect(login).toContain("options: { captchaToken: captchaToken || undefined }");
    expect(login).toContain("disabled={loading || !captchaReady}");
  });
  it("requires an hCaptcha solution for password recovery and forwards it", () => {
    expect(recovery).toContain("resetPasswordForEmail(email, {");
    expect(recovery).toContain("captchaToken,");
    expect(recovery).toContain("if (!sitekey || !captchaToken)");
    expect(recovery).toContain("<HCaptcha");
  });
});
