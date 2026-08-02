import { describe, expect, it } from "vitest";
import { validateEnvironment } from "@/lib/config/environment";

const validBase = {
  PLAYBOOK_DEPLOYMENT_ENV: "beta",
  PLAYBOOK_APP_URL: "https://beta.playbook.example",
  NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  PLAYBOOK_BETA_EXPOSURE_MODE: "allowlist",
  PLAYBOOK_BETA_REQUIRE_ACCESS_GRANT: "true",
  PLAYBOOK_RELEASE: "beta-2026-08-01",
  PLAYBOOK_OBSERVABILITY_SECRET: "observability-test-secret",
};

describe("environment contract", () => {
  it("accepts a complete beta boundary and reports optional controls", () => {
    const result = validateEnvironment(validBase);

    expect(result.ok).toBe(true);
    expect(result.warnings.map((warning) => warning.variable)).toEqual([
      "NEXT_PUBLIC_HCAPTCHA_SITE_KEY",
      "MAIL_GATEWAY_SECRET",
      "RESEND_API_KEY",
      "PLAYBOOK_EMAIL_NOTIFICATIONS",
      "PLAYBOOK_ADMIN_NOTIFICATION_EMAIL",
    ]);
  });

  it("fails closed when public data-boundary configuration is absent", () => {
    const result = validateEnvironment({ PLAYBOOK_DEPLOYMENT_ENV: "beta" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((error) => error.variable)).toEqual(
        expect.arrayContaining([
          "NEXT_PUBLIC_SUPABASE_URL",
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "PLAYBOOK_APP_URL",
          "PLAYBOOK_BETA_EXPOSURE_MODE",
          "PLAYBOOK_BETA_REQUIRE_ACCESS_GRANT",
          "PLAYBOOK_RELEASE",
          "PLAYBOOK_OBSERVABILITY_SECRET",
        ]),
      );
    }
  });

  it("rejects placeholders, insecure beta URLs, and reused service keys", () => {
    const result = validateEnvironment({
      ...validBase,
      PLAYBOOK_APP_URL: "http://beta.playbook.example",
      NEXT_PUBLIC_SUPABASE_URL: "https://your-project.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "anon-key",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ variable: "PLAYBOOK_APP_URL" }),
          expect.objectContaining({ variable: "NEXT_PUBLIC_SUPABASE_URL" }),
          expect.objectContaining({ variable: "SUPABASE_SERVICE_ROLE_KEY" }),
        ]),
      );
    }
  });
});
