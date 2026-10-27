import { assertLocalSyntheticAuthTarget } from "./helpers/assertLocalSyntheticAuthTarget.mjs";
import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { solveLocalCaptcha } from "./helpers/solveLocalCaptcha";
import { PLAYBOOK_ROLES } from "@/lib/roles/registry";
import { getOnboardingSteps } from "@/lib/onboarding/engine";

for (const role of ["family", "brand-partner"] as const) {
  test(`${role} verified account completes saved onboarding and enters its own OS`, async ({ page }) => {
    const need = (key: string) => { const value = process.env[key]; if (!value) throw Error(`Missing ${key}`); return value; };
    const base = new URL(need("PLAYWRIGHT_BASE_URL"));
    const db = new URL(need("NEXT_PUBLIC_SUPABASE_URL"));
    if (need("PBOS_ALLOW_SYNTHETIC_AUTH_WRITE") !== "YES" ||
      !["localhost", "127.0.0.1"].includes(base.hostname) ||
      !["localhost", "127.0.0.1"].includes(db.hostname)) {
      throw Error("Activation acceptance test requires isolated local environment");
    }
    assertLocalSyntheticAuthTarget();
    const admin = createClient(db.toString(), need("SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const email = `pbos-activation-${role}-${randomUUID()}@example.com`;
    const password = `${randomBytes(24).toString("base64url")}Aa1!`;
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true,
      user_metadata: { role, profile_mode: role, synthetic: true } });
    if (created.error || !created.data.user) throw created.error || Error("Synthetic user not created");
    const id = created.data.user.id;
    try {
      const answers = { first_name: "Journey", last_name: "Example", full_name: "Journey Example",
        private_test_marker: `saved-${role}`, onboarding_step_index: 0 };
      const seed = await admin.from("profiles").upsert({
        id, role, profile_mode: role, requested_role: role,
        onboarding_completed: false, verification_status: "email_confirmed",
        onboarding_data: answers,
      }, { onConflict: "id" });
      if (seed.error) throw seed.error;
      await page.goto("/login");
      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await solveLocalCaptcha(page);
    await page.getByRole("button", { name: "Log In", exact: true }).click();
      await page.waitForURL(url => url.pathname !== "/login", { timeout: 15000 });
      await page.goto(`/start?first=1&role=${role}`);
      // Use the real step transitions rather than injecting a terminal step index.
      // This exercises persistence and protects against auth-loading race conditions.
      const steps = getOnboardingSteps(role);
      for (let index = 0; index < steps.length - 1; index++) {
        await page.getByRole("button", { name: "Skip for now" }).click();
      }
      const checkbox = page.getByRole("checkbox", { name: /I have read and agree/i });
      await expect(checkbox).toBeVisible();
      await checkbox.check();
      await page.getByRole("button", { name: "Finish + Create Profile" }).click();
      await expect(page).toHaveURL(new URL(PLAYBOOK_ROLES[role].osRoute, base).toString(), { timeout: 20000 });
      const saved = await admin.from("profiles")
        .select("role,profile_mode,onboarding_completed,onboarding_completed_at,onboarding_data")
        .eq("id", id).single();
      expect(saved.error).toBeNull();
      expect(saved.data).toMatchObject({ role, profile_mode: role, onboarding_completed: true,
        onboarding_data: { private_test_marker: `saved-${role}`, community_safety_agreed: true } });
      expect(saved.data?.onboarding_completed_at).toBeTruthy();
      await page.reload();
      await expect(page).toHaveURL(new URL(PLAYBOOK_ROLES[role].osRoute, base).toString());
      // A completed private profile is editable while restricted authority stays pending.
      await page.goto("/profile");
      const firstName = page.getByLabel("First name", { exact: true });
      await expect(firstName).toHaveValue("Journey");
      await firstName.fill("Returned");
      await page.getByRole("button", { name: "Save & verify now", exact: true }).click();
      await expect(page.getByText("Saved and verified.", { exact: false })).toBeVisible();
      await page.reload();
      await expect(firstName).toHaveValue("Returned");
      await page.getByRole("button", { name: "Sign out", exact: true }).filter({ visible: true }).first().click();
      await expect(page).toHaveURL(/\/login/);
      await page.goto(PLAYBOOK_ROLES[role].osRoute);
      await expect(page).toHaveURL(/\/login/);
      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await solveLocalCaptcha(page);
      await page.getByRole("button", { name: "Log In", exact: true }).click();
      await expect(page).toHaveURL(new URL(PLAYBOOK_ROLES[role].osRoute, base).toString());
      await page.goto("/profile");
      await expect(firstName).toHaveValue("Returned");
    } finally {
      const cleanup = await admin.auth.admin.deleteUser(id);
      if (cleanup.error) console.warn("Synthetic activation account cleanup needs review");
    }
  });
}
