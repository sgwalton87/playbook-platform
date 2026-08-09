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
  const at = baseEmail.lastIndexOf("@");
  if (at < 1) throw new Error("PBOS_ACCEPTANCE_EMAIL must be a valid email address.");
  return `${baseEmail.slice(0, at)}+password-reset-${commit.slice(0, 12)}${baseEmail.slice(at)}`;
}

test("Password Reset securely changes durable credentials on desktop and mobile", async ({ page, context }) => {
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  const commit = required("PBOS_ACCEPTANCE_COMMIT");
  const oldPassword = required("PBOS_ACCEPTANCE_PASSWORD");
  const newPassword = `${oldPassword}-reset-${commit.slice(0, 8)}`;
  const email = exactRevisionEmail(required("PBOS_ACCEPTANCE_EMAIL"), commit);
  const supabaseUrl = required("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const admin = createClient(supabaseUrl, required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;
  const prior = users.data.users.find((candidate) => candidate.email === email);
  if (prior) {
    const removed = await admin.auth.admin.deleteUser(prior.id);
    if (removed.error) throw removed.error;
  }
  const created = await admin.auth.admin.createUser({
    email,
    password: oldPassword,
    email_confirm: true,
    user_metadata: { synthetic: true, acceptance_commit: commit },
  });
  if (created.error || !created.data.user) {
    throw created.error ?? new Error("Synthetic password-reset user creation failed.");
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await expect(page).toHaveURL(/\/reset-password/);
  await expect(page.getByRole("heading", { name: "Send a secure link" })).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText("If an account matches that email");
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-password-reset-desktop.png`,
    fullPage: true,
  });

  const recovery = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${new URL(page.url()).origin}/reset-password` },
  });
  if (recovery.error || !recovery.data.properties?.action_link) {
    throw recovery.error ?? new Error("Recovery link generation failed.");
  }
  await page.goto(recovery.data.properties.action_link);
  await page.waitForURL(/\/reset-password/);
  await expect(page.getByRole("heading", { name: "Create your new password" })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("Confirm new password", { exact: true }).fill("does-not-match");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByRole("alert")).toContainText("passwords do not match");
  await page.getByLabel("Confirm new password", { exact: true }).fill(newPassword);
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
  await expect(page.getByRole("heading", { name: "Your account is secure." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue to log in" })).toHaveAttribute("href", "/login");

  const verifier = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const oldCredential = await verifier.auth.signInWithPassword({ email, password: oldPassword });
  expect(oldCredential.error).toBeTruthy();
  const newCredential = await verifier.auth.signInWithPassword({ email, password: newPassword });
  expect(newCredential.error).toBeNull();
  expect(newCredential.data.user?.id).toBe(created.data.user.id);
  await verifier.auth.signOut();

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
