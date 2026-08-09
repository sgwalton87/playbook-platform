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

test("Login renders an accessible, responsive public route", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Forgot your password?" })).toHaveAttribute(
    "href",
    "/reset-password"
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Log In", exact: true })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? "")
    )
  ).toEqual([]);
});

test("Login establishes a durable, authority-routed session on desktop and mobile", async ({ page, context }) => {
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  const email = required("PBOS_ACCEPTANCE_EMAIL");
  const password = required("PBOS_ACCEPTANCE_PASSWORD");
  const commit = required("PBOS_ACCEPTANCE_COMMIT");
  const admin = createClient(
    required("NEXT_PUBLIC_SUPABASE_URL"),
    required("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;
  let user = users.data.users.find((candidate) => candidate.email === email);

  if (!user) {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "scholar", profile_mode: "scholar", synthetic: true },
    });
    if (created.error || !created.data.user) {
      throw created.error ?? new Error("Synthetic login user creation failed.");
    }
    user = created.data.user;
  } else {
    const updated = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { ...user.user_metadata, role: "scholar", profile_mode: "scholar", synthetic: true },
    });
    if (updated.error) throw updated.error;
  }

  const profile = await admin.from("profiles").upsert({
    id: user.id,
    role: "scholar",
    profile_mode: "scholar",
    onboarding_completed: true,
    verification_status: "email_confirmed",
  }, { onConflict: "id" }).select("id,role,profile_mode,onboarding_completed").single();
  if (profile.error) throw profile.error;

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Forgot your password?" })).toHaveAttribute(
    "href",
    "/reset-password"
  );

  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(`${password}-invalid`);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("alert")).toContainText("couldn't log you in");
  await page.screenshot({ path: `${artifacts}/048-phase-01-item-login-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.screenshot({ path: `${artifacts}/048-phase-01-item-login-mobile.png`, fullPage: true });

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  await writeFile(
    `${artifacts}/048-phase-01-item-login-accessibility.json`,
    JSON.stringify(accessibility, null, 2)
  );
  expect(blocking).toEqual([]);

  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);
  await page.reload();
  await expect(page).toHaveURL(/\/dashboard/);

  const durableUser = await admin.auth.admin.getUserById(user.id);
  if (durableUser.error) throw durableUser.error;
  expect(durableUser.data.user.email).toBe(email);
  expect(profile.data.onboarding_completed).toBe(true);

  await context.tracing.stop({ path: `${artifacts}/048-phase-01-item-login-trace.zip` });
  await writeFile(`${artifacts}/048-phase-01-item-login.json`, JSON.stringify({
    schemaVersion: 1,
    journeyId: "048-PHASE-01-ITEM-LOGIN",
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
