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

test("Remember Me renders an accessible, responsive opt-in control", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  const rememberMe = page.getByRole("checkbox", { name: "Remember me" });
  await expect(rememberMe).toBeVisible();
  await expect(rememberMe).not.toBeChecked();
  await expect(page.locator("#remember-me-help")).toContainText("personal device");
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("");

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

test("Remember Me creates an explicit durable session without retaining identity fields", async ({
  browser,
  context,
  page,
}) => {
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
      throw created.error ?? new Error("Synthetic Remember Me user creation failed.");
    }
    user = created.data.user;
  } else {
    const updated = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...user.user_metadata,
        role: "scholar",
        profile_mode: "scholar",
        synthetic: true,
      },
    });
    if (updated.error) throw updated.error;
  }

  const profile = await admin.from("profiles").upsert({
    id: user.id,
    role: "scholar",
    profile_mode: "scholar",
    onboarding_completed: true,
    verification_status: "email_confirmed",
  }, { onConflict: "id" });
  if (profile.error) throw profile.error;

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  const rememberMe = page.getByRole("checkbox", { name: "Remember me" });
  await expect(rememberMe).not.toBeChecked();
  await expect(rememberMe).toHaveAttribute("aria-describedby", "remember-me-help");
  await expect(page.locator("#remember-me-help")).toContainText("personal device");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);

  const sessionCookies = (await context.cookies()).filter((cookie) => cookie.name.startsWith("sb-"));
  expect(sessionCookies.length).toBeGreaterThan(0);
  expect(sessionCookies.every((cookie) => cookie.expires === -1)).toBe(true);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("playbook_saved_email")))
    .toBeNull();

  await context.clearCookies();
  await page.goto("/login");
  await rememberMe.check();
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-remember-me-desktop.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);

  const durableCookies = (await context.cookies()).filter((cookie) => cookie.name.startsWith("sb-"));
  expect(durableCookies.length).toBeGreaterThan(0);
  expect(durableCookies.some((cookie) => cookie.expires > Date.now() / 1000)).toBe(true);
  const storageState = await context.storageState();

  const restartedContext = await browser.newContext({ storageState });
  const restartedPage = await restartedContext.newPage();
  await restartedPage.setViewportSize({ width: 390, height: 844 });
  await restartedPage.goto("/dashboard");
  await expect(restartedPage).toHaveURL(/\/dashboard/);
  await restartedPage.goto("/login");
  await expect(restartedPage.getByRole("checkbox", { name: "Remember me" })).toBeChecked();
  await expect(restartedPage.getByLabel("Email", { exact: true })).toHaveValue("");
  const hasHorizontalOverflow = await restartedPage.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  await restartedPage.screenshot({
    path: `${artifacts}/048-phase-01-item-remember-me-mobile.png`,
    fullPage: true,
  });

  const accessibility = await new AxeBuilder({ page: restartedPage }).analyze();
  const blocking = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  await writeFile(
    `${artifacts}/048-phase-01-item-remember-me-accessibility.json`,
    JSON.stringify(accessibility, null, 2)
  );
  expect(blocking).toEqual([]);
  await restartedContext.close();

  const durableUser = await admin.auth.admin.getUserById(user.id);
  if (durableUser.error) throw durableUser.error;
  expect(durableUser.data.user.email).toBe(email);
  const durableProfile = await admin
    .from("profiles")
    .select("role,profile_mode,onboarding_completed")
    .eq("id", user.id)
    .single();
  if (durableProfile.error) throw durableProfile.error;
  expect(durableProfile.data).toEqual({
    role: "scholar",
    profile_mode: "scholar",
    onboarding_completed: true,
  });

  await context.tracing.stop({
    path: `${artifacts}/048-phase-01-item-remember-me-trace.zip`,
  });
  await writeFile(
    `${artifacts}/048-phase-01-item-remember-me.json`,
    JSON.stringify({
      schemaVersion: 1,
      journeyId: "048-PHASE-01-ITEM-REMEMBER-ME",
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
