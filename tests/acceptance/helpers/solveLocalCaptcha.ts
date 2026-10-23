import { expect, type Page } from "@playwright/test";

/** Complete hCaptcha with its public test site key, never against production. */
export async function solveLocalCaptcha(page: Page): Promise<void> {
  const target = new URL(process.env.PLAYWRIGHT_BASE_URL || "");
  const db = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
  if (!["127.0.0.1", "localhost"].includes(target.hostname) ||
      !["127.0.0.1", "localhost"].includes(db.hostname) ||
      process.env.PBOS_ALLOW_SYNTHETIC_AUTH_WRITE !== "YES" ||
      process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY !== "10000000-ffff-ffff-ffff-000000000001") {
    throw new Error("CAPTCHA test helper is restricted to disposable local QA using the official test site key");
  }
  const widget = page.frameLocator('iframe[title*="hCaptcha"]').first();
  await widget.locator("#checkbox").click({ timeout: 20000 });
  await expect(page.getByText("Security check complete.", { exact: true })).toBeVisible({ timeout: 20000 });
}
