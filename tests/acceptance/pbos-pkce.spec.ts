import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
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
  return `${baseEmail.slice(0, separator)}+pkce-${commit.slice(0, 12)}${baseEmail.slice(separator)}`;
}

function challengeFor(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

test("PKCE binds a one-time verifier to auth callback exchange", async ({ page, context }) => {
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
    user_metadata: { role: "scholar", profile_mode: "scholar", requested_role: "scholar" },
  });
  if (created.error || !created.data.user) throw created.error ?? new Error("PKCE user creation failed.");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-pkce-desktop.png`,
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

  const authorize = new URL(authorizeUrl);
  const codeChallenge = authorize.searchParams.get("code_challenge");
  expect(codeChallenge).toBeTruthy();
  expect(authorize.searchParams.get("code_challenge_method")).toBe("s256");
  await page.unroute("**/auth/v1/authorize?**");

  const authUser = {
    id: created.data.user.id,
    aud: "authenticated",
    role: "authenticated",
    email,
    app_metadata: { provider: "google", providers: ["google"] },
    user_metadata: { role: "scholar" },
    created_at: new Date().toISOString(),
  };
  let exchangedVerifier = "";
  let exchangeCount = 0;
  await page.route("**/auth/v1/token?grant_type=pkce", async (route) => {
    exchangeCount += 1;
    const body = route.request().postDataJSON() as { code_verifier?: string };
    exchangedVerifier = body.code_verifier ?? "";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "pkce-acceptance-access-token",
        refresh_token: "pkce-acceptance-refresh-token",
        token_type: "bearer",
        expires_in: 3600,
        user: authUser,
      }),
    });
  });
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

  await page.goto("/auth/callback?code=one-time-authorization-code&provider=google&role=scholar");
  await page.waitForURL(/\/start\?first=1&role=scholar/);
  expect(exchangeCount).toBe(1);
  expect(exchangedVerifier.length).toBeGreaterThan(42);
  expect(challengeFor(exchangedVerifier)).toBe(codeChallenge);

  await page.goto("/auth/callback?code=one-time-authorization-code&provider=google&role=scholar");
  await page.waitForURL(/\/login\?error=auth_callback/);
  expect(exchangeCount).toBe(1);

  await page.unroute("**/auth/v1/token?grant_type=pkce");
  await page.unroute("**/auth/v1/user");
  await page.unroute("**/rest/v1/profiles**");
  await context.clearCookies();

  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/start/);
  await page.goto("/auth/callback");
  await page.waitForURL(/\/start\?first=1&role=scholar/);

  const persisted = await admin
    .from("profiles")
    .select("id,role,profile_mode,onboarding_completed,verification_status")
    .eq("id", created.data.user.id)
    .single();
  if (persisted.error) throw persisted.error;
  expect(persisted.data).toMatchObject({
    role: "scholar",
    profile_mode: "scholar",
    onboarding_completed: false,
    verification_status: "email_confirmed",
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/auth/callback?code=expired-one-time-code");
  await expect(page.getByRole("heading", { name: "Opening your Playbook" })).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-pkce-mobile.png`,
    fullPage: true,
  });

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  await writeFile(
    `${artifacts}/048-phase-01-item-pkce-accessibility.json`,
    JSON.stringify(accessibility, null, 2)
  );
  expect(blocking).toEqual([]);

  await context.tracing.stop({ path: `${artifacts}/048-phase-01-item-pkce-trace.zip` });
  await writeFile(
    `${artifacts}/048-phase-01-item-pkce.json`,
    JSON.stringify({
      schemaVersion: 1,
      journeyId: "048-PHASE-01-ITEM-PKCE",
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
