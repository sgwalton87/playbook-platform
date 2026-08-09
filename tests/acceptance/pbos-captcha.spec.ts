import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const artifacts = "artifacts/pbos-acceptance";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing PBOS acceptance configuration: ${name}`);
  return value;
}

function exactRevisionEmail(baseEmail: string, commit: string): string {
  const separator = baseEmail.lastIndexOf("@");
  if (separator < 1) throw new Error("PBOS_ACCEPTANCE_EMAIL must be a valid email address.");
  return `${baseEmail.slice(0, separator)}+captcha-${commit.slice(0, 12)}${baseEmail.slice(separator)}`;
}

test("CAPTCHA gates signup and creates an authorized account after verification", async ({ page, context }) => {
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  const commit = required("PBOS_ACCEPTANCE_COMMIT");
  const password = required("PBOS_ACCEPTANCE_PASSWORD");
  const email = exactRevisionEmail(required("PBOS_ACCEPTANCE_EMAIL"), commit);
  const admin = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;
  const priorUser = users.data.users.find((candidate) => candidate.email === email);
  if (priorUser) {
    const removed = await admin.auth.admin.deleteUser(priorUser.id);
    if (removed.error) throw removed.error;
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login?mode=signup");
  await page.getByRole("button", { name: /Parent \/ Guardian/ }).click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);

  const createAccount = page.getByRole("button", { name: "Create Account", exact: true });
  await expect(page.getByRole("heading", { name: "Security check" })).toBeVisible();
  await expect(page.getByText("Security check required.")).toBeVisible();
  await expect(createAccount).toBeDisabled();

  const challenge = page.frameLocator('iframe[title*="hCaptcha"]');
  await challenge.getByRole("checkbox").click();
  await expect(page.getByText("Security check complete.")).toBeVisible({ timeout: 30_000 });
  await expect(createAccount).toBeEnabled();
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-captcha-desktop.png`,
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-captcha-mobile.png`,
    fullPage: true,
  });

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  await writeFile(
    `${artifacts}/048-phase-01-item-captcha-accessibility.json`,
    JSON.stringify(accessibility, null, 2)
  );
  expect(blocking).toEqual([]);

  const signupRequest = page.waitForRequest((request) =>
    request.url().includes("/auth/v1/signup") && request.method() === "POST"
  );
  await createAccount.click();
  const requestBody = (await signupRequest).postDataJSON() as { gotrue_meta_security?: { captcha_token?: string } };
  expect(requestBody.gotrue_meta_security?.captcha_token).toBeTruthy();
  await page.waitForURL(/\/check-email/);

  const createdUsers = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (createdUsers.error) throw createdUsers.error;
  const user = createdUsers.data.users.find((candidate) => candidate.email === email);
  expect(user).toBeTruthy();
  expect(user?.user_metadata).toMatchObject({
    role: "family",
    profile_mode: "family",
    requested_role: "family",
    verification_status: "email_pending",
  });

  await context.tracing.stop({ path: `${artifacts}/048-phase-01-item-captcha-trace.zip` });
  await writeFile(
    `${artifacts}/048-phase-01-item-captcha.json`,
    JSON.stringify({
      schemaVersion: 1,
      journeyId: "048-PHASE-01-ITEM-CAPTCHA",
      commit,
      checks: [
        { dimension: "ROUTE", passed: true, detail: "executed evidence" },
        { dimension: "DURABLE_DATA", passed: true, detail: "executed evidence" },
        { dimension: "AUTHORITY", passed: true, detail: "executed evidence" },
        { dimension: "PBOS_INTEGRATION", passed: true, detail: "executed evidence" },
        { dimension: "SECURITY", passed: true, detail: "executed evidence" },
      ],
    }, null, 2)
  );
});
