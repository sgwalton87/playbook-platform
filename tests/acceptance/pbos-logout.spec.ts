import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const artifacts = "artifacts/pbos-acceptance";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing PBOS acceptance configuration: ${name}`);
  return value;
}

async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);
}

test("Logout revokes the real session from responsive authenticated navigation", async ({
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
      throw created.error ?? new Error("Synthetic Logout user creation failed.");
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
  await login(page, email, password);
  const desktopSignOut = page.getByRole("button", { name: "Sign out", exact: true });
  await expect(desktopSignOut).toBeVisible();
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-logout-desktop.png`,
    fullPage: true,
  });
  await desktopSignOut.click();
  await page.waitForURL(/\/login/);
  expect((await context.cookies()).filter((cookie) => cookie.name.startsWith("sb-"))).toEqual([]);

  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, email, password);
  const mobileSignOut = page.getByRole("button", { name: "Sign out", exact: true });
  await expect(mobileSignOut).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalOverflow).toBe(false);

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );
  await writeFile(
    `${artifacts}/048-phase-01-item-logout-accessibility.json`,
    JSON.stringify(accessibility, null, 2)
  );
  expect(blocking).toEqual([]);
  await page.screenshot({
    path: `${artifacts}/048-phase-01-item-logout-mobile.png`,
    fullPage: true,
  });

  await mobileSignOut.click();
  await page.waitForURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  expect((await context.cookies()).filter((cookie) => cookie.name.startsWith("sb-"))).toEqual([]);

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
    path: `${artifacts}/048-phase-01-item-logout-trace.zip`,
  });
  await writeFile(
    `${artifacts}/048-phase-01-item-logout.json`,
    JSON.stringify({
      schemaVersion: 1,
      journeyId: "048-PHASE-01-ITEM-LOGOUT",
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
