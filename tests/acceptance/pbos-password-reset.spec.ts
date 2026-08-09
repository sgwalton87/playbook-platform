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

test("Password Reset exposes a responsive, accessible public request route", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/reset-password");
  await expect(page.getByRole("heading", { name: "Request a secure reset link" })).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  await expect(page.getByLabel("New password", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Return to login" })).toHaveAttribute("href", "/login");

  await page.setViewportSize({ width: 390, height: 844 });
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  )).toEqual([]);
});

test("Password Reset securely changes credentials while preserving profile authority", async ({ page, context }) => {
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  const email = required("PBOS_ACCEPTANCE_EMAIL");
  const originalPassword = required("PBOS_ACCEPTANCE_PASSWORD");
  const commit = required("PBOS_ACCEPTANCE_COMMIT");
  const resetPassword = `${originalPassword}-${commit.slice(0, 8)}-reset`;
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
      password: originalPassword,
      email_confirm: true,
      user_metadata: { role: "mentor", profile_mode: "mentor", synthetic: true },
    });
    if (created.error || !created.data.user) {
      throw created.error ?? new Error("Synthetic password-reset user creation failed.");
    }
    user = created.data.user;
  } else {
    const updated = await admin.auth.admin.updateUserById(user.id, {
      password: originalPassword,
      email_confirm: true,
      user_metadata: { ...user.user_metadata, role: "mentor", profile_mode: "mentor", synthetic: true },
    });
    if (updated.error) throw updated.error;
  }

  const profile = await admin.from("profiles").upsert({
    id: user.id,
    role: "mentor",
    profile_mode: "mentor",
    onboarding_completed: true,
    verification_status: "email_confirmed",
  }, { onConflict: "id" });
  if (profile.error) throw profile.error;

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/reset-password");
  await expect(page.getByRole("heading", { name: "Request a secure reset link" })).toBeVisible();
  await expect(page.getByLabel("New password", { exact: true })).toHaveCount(0);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText("If an account matches that email");
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-password-reset-desktop.png`,
    fullPage: true,
  });

  const generated = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: new URL("/reset-password", page.url()).toString() },
  });
  if (generated.error) throw generated.error;
  expect(generated.data.properties.hashed_token).toBeTruthy();
  const recoveryUrl = new URL("/reset-password", page.url());
  recoveryUrl.searchParams.set("token_hash", generated.data.properties.hashed_token);
  recoveryUrl.searchParams.set("type", "recovery");
  await page.goto(recoveryUrl.toString());
  await expect(page.getByRole("heading", { name: "Create a new password" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("New password", { exact: true }).fill(resetPassword);
  await page.getByLabel("Confirm new password").fill(`${resetPassword}-mismatch`);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByRole("alert")).toContainText("do not match");
  await page.getByLabel("Confirm new password").fill(resetPassword);
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-password-reset-mobile.png`,
    fullPage: true,
  });

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  await writeFile(
    `${artifacts}/048-phase-01-item-password-reset-accessibility.json`,
    JSON.stringify(accessibility, null, 2)
  );
  expect(blocking).toEqual([]);

  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByRole("heading", { name: "Your account is secure" })).toBeVisible();
  await page.getByRole("link", { name: "Continue to login" }).click();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(resetPassword);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/mentor-os/);

  const durableUser = await admin.auth.admin.getUserById(user.id);
  if (durableUser.error) throw durableUser.error;
  expect(durableUser.data.user.updated_at).toBeTruthy();
  const durableProfile = await admin
    .from("profiles")
    .select("role,profile_mode,onboarding_completed")
    .eq("id", user.id)
    .single();
  if (durableProfile.error) throw durableProfile.error;
  expect(durableProfile.data).toEqual({
    role: "mentor",
    profile_mode: "mentor",
    onboarding_completed: true,
  });

  const restored = await admin.auth.admin.updateUserById(user.id, { password: originalPassword });
  if (restored.error) throw restored.error;

  await context.tracing.stop({
    path: `${artifacts}/048-phase-01-item-password-reset-trace.zip`,
  });
  await writeFile(
    `${artifacts}/048-phase-01-item-password-reset.json`,
    JSON.stringify({
      schemaVersion: 1,
      journeyId: "048-PHASE-01-ITEM-PASSWORD-RESET",
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
