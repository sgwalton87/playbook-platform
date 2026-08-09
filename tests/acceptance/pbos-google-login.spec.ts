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
  return `${baseEmail.slice(0, at)}+google-${commit.slice(0, 12)}${baseEmail.slice(at)}`;
}

test("Google Login creates a durable profile and preserves profile authority", async ({ page, context }) => {
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

  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { provider: "google", providers: ["google"] },
    user_metadata: { synthetic: true },
  });
  if (created.error || !created.data.user) {
    throw created.error ?? new Error("Synthetic Google acceptance user creation failed.");
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login?mode=signup");
  await page.getByRole("button", { name: /Parent \/ Guardian/ }).click();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-google-login-desktop.png`,
    fullPage: true,
  });

  let authorizeUrl = "";
  await page.route("**/auth/v1/authorize?**", async (route) => {
    authorizeUrl = route.request().url();
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ url: `${new URL(page.url()).origin}/login?error=auth_callback` }),
    });
  });
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await page.waitForURL(/\/login\?error=auth_callback/);
  const authorize = new URL(authorizeUrl);
  expect(authorize.searchParams.get("provider")).toBe("google");
  const redirectTo = new URL(authorize.searchParams.get("redirect_to") ?? "");
  expect(redirectTo.pathname).toBe("/auth/callback");
  expect(redirectTo.searchParams.get("provider")).toBe("google");
  expect(redirectTo.searchParams.get("role")).toBe("family");
  await page.unroute("**/auth/v1/authorize?**");

  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/start/);
  const profileRemoval = await admin.from("profiles").delete().eq("id", created.data.user.id);
  if (profileRemoval.error) throw profileRemoval.error;

  await page.goto("/auth/callback?provider=google&role=family");
  await page.waitForURL(/\/start\?first=1&role=family/);
  const persisted = await admin
    .from("profiles")
    .select("id,role,profile_mode,onboarding_completed,verification_status")
    .eq("id", created.data.user.id)
    .single();
  if (persisted.error) throw persisted.error;
  expect(persisted.data).toMatchObject({
    role: "family",
    profile_mode: "family",
    onboarding_completed: false,
    verification_status: "email_confirmed",
  });

  const authorityProfile = await admin.from("profiles").update({
    role: "mentor",
    profile_mode: "mentor",
    onboarding_completed: true,
  }).eq("id", created.data.user.id);
  if (authorityProfile.error) throw authorityProfile.error;
  await page.goto("/auth/callback?provider=google&role=district");
  await page.waitForURL(/\/mentor-os/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-google-login-mobile.png`,
    fullPage: true,
  });

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  await writeFile(
    `${artifacts}/048-phase-01-item-google-login-accessibility.json`,
    JSON.stringify(accessibility, null, 2)
  );
  expect(blocking).toEqual([]);

  await context.tracing.stop({
    path: `${artifacts}/048-phase-01-item-google-login-trace.zip`,
  });
  await writeFile(
    `${artifacts}/048-phase-01-item-google-login.json`,
    JSON.stringify({
      schemaVersion: 1,
      journeyId: "048-PHASE-01-ITEM-GOOGLE-LOGIN",
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
