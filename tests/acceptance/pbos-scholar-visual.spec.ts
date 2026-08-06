import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing Scholar visual acceptance configuration: ${name}`);
  return value;
};

test("PGSL-007 matches the approved responsive Scholar Dashboard", async ({ page }) => {
  const email = required("PBOS_ACCEPTANCE_EMAIL");
  const password = required("PBOS_ACCEPTANCE_PASSWORD");
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;
  const existing = users.data.users.find((candidate) => candidate.email === email);
  if (existing) {
    const updated = await admin.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
    if (updated.error) throw updated.error;
  } else {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "scholar", profile_mode: "scholar", synthetic: true },
    });
    if (created.error) throw created.error;
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);
  await expect(page.getByTestId("scholar-dashboard-canon")).toHaveAttribute("data-visual-canon", "PGSL-007");
  await expect(page.getByTestId("scholar-dashboard-canon")).not.toHaveAttribute("data-record-state", "loading");
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  await expect(page).toHaveScreenshot("pgsl-007-scholar-dashboard-desktop.png", {
    animations: "disabled",
    fullPage: true,
    maxDiffPixelRatio: 0.02,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByTestId("scholar-dashboard-canon")).toBeVisible();
  await expect(page.getByTestId("scholar-dashboard-canon")).not.toHaveAttribute("data-record-state", "loading");
  await expect(page).toHaveScreenshot("pgsl-007-scholar-dashboard-mobile.png", {
    animations: "disabled",
    fullPage: true,
    maxDiffPixelRatio: 0.02,
  });
});
