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

test("Close Browser Logout requires a new login on desktop and mobile", async ({
  browser,
  context,
  page,
}) => {
  await mkdir(artifacts, { recursive: true });

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
      throw created.error ?? new Error("Synthetic Close Browser Logout user creation failed.");
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
  await expect(page.locator("#remember-me-help")).toContainText("close the browser");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);

  const authCookies = (await context.cookies()).filter((cookie) => cookie.name.startsWith("sb-"));
  expect(authCookies.length).toBeGreaterThan(0);
  expect(authCookies.every((cookie) => cookie.expires === -1)).toBe(true);
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-close-browser-logout-desktop.png`,
    fullPage: true,
  });

  const beforeClose = await context.storageState();
  const afterClose = {
    ...beforeClose,
    cookies: beforeClose.cookies.filter((cookie) => cookie.expires !== -1),
  };
  await page.close();

  const restartedContext = await browser.newContext({ storageState: afterClose });
  await restartedContext.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const restartedPage = await restartedContext.newPage();
  await restartedPage.setViewportSize({ width: 390, height: 844 });
  await restartedPage.goto("/dashboard");
  await restartedPage.waitForURL(/\/login/);
  await expect(restartedPage.getByRole("heading", { name: "Log in" })).toBeVisible();
  expect((await restartedContext.cookies()).filter((cookie) => cookie.name.startsWith("sb-"))).toEqual([]);

  const hasHorizontalOverflow = await restartedPage.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);
  const accessibility = await new AxeBuilder({ page: restartedPage }).analyze();
  const blocking = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  await writeFile(
    `${artifacts}/048-phase-01-item-close-browser-logout-accessibility.json`,
    JSON.stringify(accessibility, null, 2)
  );
  expect(blocking).toEqual([]);
  await restartedPage.screenshot({
    path: `${artifacts}/048-phase-01-item-close-browser-logout-mobile.png`,
    fullPage: true,
  });

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

  await restartedContext.tracing.stop({
    path: `${artifacts}/048-phase-01-item-close-browser-logout-trace.zip`,
  });
  await restartedContext.close();
  await writeFile(
    `${artifacts}/048-phase-01-item-close-browser-logout.json`,
    JSON.stringify({
      schemaVersion: 1,
      journeyId: "048-PHASE-01-ITEM-CLOSE-BROWSER-LOGOUT",
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
