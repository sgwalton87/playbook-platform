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
  return `${baseEmail.slice(0, separator)}+email-verification-${commit.slice(0, 12)}${baseEmail.slice(separator)}`;
}

const hasLiveAcceptanceConfiguration = [
  "PBOS_ACCEPTANCE_COMMIT",
  "PBOS_ACCEPTANCE_EMAIL",
  "PBOS_ACCEPTANCE_PASSWORD",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PLAYWRIGHT_BASE_URL",
].every((name) => Boolean(process.env[name]));

test("Email verification confirms durable identity and preserves role authority", async ({ page, context }) => {
  test.skip(
    !hasLiveAcceptanceConfiguration,
    "PBOS Kernel supplies exact-revision credentials for durable provider acceptance."
  );
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
  const prior = users.data.users.find((candidate) => candidate.email === email);
  if (prior) {
    const removed = await admin.auth.admin.deleteUser(prior.id);
    if (removed.error) throw removed.error;
  }

  const link = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      redirectTo: `${required("PLAYWRIGHT_BASE_URL")}/auth/callback`,
      data: {
        role: "family",
        profile_mode: "family",
        requested_role: "family",
        verification_status: "email_pending",
      },
    },
  });
  if (link.error) throw link.error;
  const userId = link.data.user.id;
  const tokenHash = link.data.properties.hashed_token;

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/check-email?email=${encodeURIComponent(email)}&role=family`);
  await expect(page.getByRole("heading", { name: "Check your inbox." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Parent / Guardian" })).toBeVisible();
  await expect(page.getByText(email, { exact: true })).toHaveCount(0);
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-email-verification-desktop.png`,
    fullPage: true,
  });

  let resendBody = "";
  await page.route("**/auth/v1/resend", async (route) => {
    resendBody = route.request().postData() ?? "";
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.getByRole("button", { name: "Resend verification email" }).click();
  await expect(page.getByRole("status")).toContainText("A new verification email is on its way.");
  await expect(page.getByRole("button", { name: /Resend available in/ })).toBeDisabled();
  expect(resendBody).toContain(email);
  expect(resendBody).toContain("/auth/callback");
  await page.unroute("**/auth/v1/resend");

  await page.goto(`/auth/callback?token_hash=${encodeURIComponent(tokenHash)}&type=signup&role=scholar`);
  await page.waitForURL(/\/start\?first=1&role=family/);

  const persisted = await admin
    .from("profiles")
    .select("id,role,profile_mode,onboarding_completed,verification_status")
    .eq("id", userId)
    .single();
  if (persisted.error) throw persisted.error;
  expect(persisted.data).toMatchObject({
    id: userId,
    role: "family",
    profile_mode: "family",
    onboarding_completed: false,
    verification_status: "email_confirmed",
  });

  const confirmed = await admin.auth.admin.getUserById(userId);
  if (confirmed.error) throw confirmed.error;
  expect(confirmed.data.user.email_confirmed_at).toBeTruthy();

  await context.clearCookies();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/auth/callback?token_hash=expired-or-invalid&type=recovery");
  await page.waitForURL(/\/check-email\?status=invalid/);
  await expect(page.getByRole("status")).toContainText("invalid or has expired");
  await expect(page.getByRole("button", { name: "Resend verification email" })).toBeDisabled();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-email-verification-mobile.png`,
    fullPage: true,
  });

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  await writeFile(
    `${artifacts}/048-phase-01-item-email-verification-accessibility.json`,
    JSON.stringify(accessibility, null, 2)
  );
  expect(blocking).toEqual([]);

  await context.tracing.stop({
    path: `${artifacts}/048-phase-01-item-email-verification-trace.zip`,
  });
  await writeFile(
    `${artifacts}/048-phase-01-item-email-verification.json`,
    JSON.stringify({
      schemaVersion: 1,
      journeyId: "048-PHASE-01-ITEM-EMAIL-VERIFICATION",
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

test("Email verification is responsive, accessible, and secure without provider secrets", async ({ page }) => {
  test.skip(hasLiveAcceptanceConfiguration, "The exact-revision provider journey supersedes this local check.");

  const email = "local-scholar@example.org";
  const authUser = {
    id: "00000000-0000-4000-8000-000000000048",
    aud: "authenticated",
    role: "authenticated",
    email,
    email_confirmed_at: "2026-08-09T12:00:00.000Z",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {
      role: "family",
      profile_mode: "family",
      requested_role: "family",
      verification_status: "email_pending",
    },
    created_at: "2026-08-09T11:00:00.000Z",
  };

  await page.route("**/auth/v1/resend", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  );
  await page.route("**/auth/v1/verify", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "local-verification-access-token",
        refresh_token: "local-verification-refresh-token",
        token_type: "bearer",
        expires_in: 3600,
        user: authUser,
      }),
    })
  );
  await page.route("**/auth/v1/user", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(authUser) })
  );
  await page.route("**/rest/v1/profiles**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
      return;
    }
    await route.fulfill({ status: 201, contentType: "application/json", body: "[]" });
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/check-email?email=${encodeURIComponent(email)}&role=family`);
  await expect(page.getByRole("heading", { name: "Check your inbox." })).toBeVisible();
  await expect(page.getByText(email, { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Resend verification email" }).click();
  await expect(page.getByRole("status")).toContainText("A new verification email is on its way.");

  await page.goto("/auth/callback?token_hash=local-valid-hash&type=signup&role=scholar");
  await page.waitForURL(/\/start\?first=1&role=family/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/auth/callback?token_hash=local-invalid-hash&type=recovery");
  await page.waitForURL(/\/check-email\?status=invalid/);
  await expect(page.getByRole("status")).toContainText("invalid or has expired");
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  )).toBe(false);

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  )).toEqual([]);
});
