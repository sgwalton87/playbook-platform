import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

test("synthetic profile data survives edit and reload", async ({ page }) => {
  const need = (key: string) => { const val = process.env[key]; if (!val) throw new Error(`Missing ${key}`); return val; };
  const target = new URL(need("PLAYWRIGHT_BASE_URL"));
  if (!(target.hostname === "localhost" || target.hostname === "127.0.0.1" || target.hostname.endsWith("-preview.vercel.app"))) {
    throw new Error("Run only against an isolated preview environment");
  }
  const admin = createClient(need("NEXT_PUBLIC_SUPABASE_URL"), need("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const email = `pbos-recovery-${randomUUID()}@example.com`;
  const password = `${randomBytes(24).toString("base64url")}Aa1!`;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true,
    user_metadata: { role: "scholar-athlete", profile_mode: "scholar-athlete", synthetic: true } });
  if (created.error || !created.data.user) throw created.error ?? new Error("Account creation failed");
  const id = created.data.user.id;
  try {
    const seed = await admin.from("profiles").upsert({ id, role: "scholar-athlete", profile_mode: "scholar-athlete",
      onboarding_completed: true, verification_status: "email_confirmed",
      first_name: "Historical", last_name: "Profile", school: "Old Academy",
      onboarding_data: { full_name: "Recovery Scholar", school: "Recovery Academy",
        primary_sport: "Basketball", current_team: "Recovery Club",
        activities: ["Service learning"], top_schools: ["Princeton"] } }, { onConflict: "id" });
    if (seed.error) throw seed.error;
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Log In", exact: true }).click();
    await page.goto("/profile");
    const school = page.locator('input[value="Recovery Academy"]').first();
    await expect(school).toBeVisible();
    await school.fill("Recovery Institute");
    await page.getByRole("button", { name: /save changes/i }).first().click();
    await expect.poll(async () => {
      const row = await admin.from("profiles").select("school").eq("id", id).single();
      return row.data?.school;
    }).toBe("Recovery Institute");
    await page.reload();
    await expect(page.locator('input[value="Recovery Institute"]').first()).toBeVisible();
    const check = await admin.from("profiles").select("onboarding_data").eq("id", id).single();
    expect(check.data?.onboarding_data).toMatchObject({ school: "Recovery Institute",
      activities: ["Service learning"], primary_sport: "Basketball", current_team: "Recovery Club" });
  } finally {
    const cleanup = await admin.auth.admin.deleteUser(id);
    if (cleanup.error) console.warn("Synthetic user cleanup needs operator follow-up");
  }
});
