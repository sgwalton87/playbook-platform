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
  return `${baseEmail.slice(0, separator)}+signup-${commit.slice(0, 12)}${baseEmail.slice(separator)}`;
}

test("Signup creates a durable role-authorized account and enters onboarding", async ({ page, context }) => {
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
  const priorSyntheticUser = users.data.users.find((candidate) => candidate.email === email);
  if (priorSyntheticUser) {
    const removed = await admin.auth.admin.deleteUser(priorSyntheticUser.id);
    if (removed.error) throw removed.error;
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login?mode=signup");
  await expect(page.getByRole("heading", { name: "Sign up" })).toBeVisible();
  await expect(page.getByText("Choose your pathway")).toBeVisible();
  await page.getByRole("button", { name: /Parent \/ Guardian/ }).click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await expect(page.getByText("Use at least 8 characters")).toBeVisible();
  await page.screenshot({ path: `${artifacts}/048-phase-01-item-signup-desktop.png`, fullPage: true });

  await page.getByRole("button", { name: "Create Account", exact: true }).click();
  await page.waitForURL(/\/check-email/);
  await expect(page.getByRole("heading", { name: "Check your inbox." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Parent / Guardian" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  await page.screenshot({ path: `${artifacts}/048-phase-01-item-signup-mobile.png`, fullPage: true });

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  await writeFile(
    `${artifacts}/048-phase-01-item-signup-accessibility.json`,
    JSON.stringify(accessibility, null, 2)
  );
  expect(blocking).toEqual([]);

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

  const confirmed = await admin.auth.admin.updateUserById(user!.id, { email_confirm: true });
  if (confirmed.error) throw confirmed.error;
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/start\?first=1&role=family/);

  await context.tracing.stop({ path: `${artifacts}/048-phase-01-item-signup-trace.zip` });
  await writeFile(`${artifacts}/048-phase-01-item-signup.json`, JSON.stringify({
    schemaVersion: 1,
    journeyId: "048-PHASE-01-ITEM-SIGNUP",
    commit,
    checks: [
      { dimension: "ROUTE", passed: true, detail: "executed evidence" },
      { dimension: "DURABLE_DATA", passed: true, detail: "executed evidence" },
      { dimension: "AUTHORITY", passed: true, detail: "executed evidence" },
      { dimension: "PBOS_INTEGRATION", passed: true, detail: "executed evidence" },
      { dimension: "SECURITY", passed: true, detail: "executed evidence" },
    ],
  }, null, 2));
});
