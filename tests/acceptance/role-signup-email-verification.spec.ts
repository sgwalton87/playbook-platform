import { assertLocalSyntheticAuthTarget } from "./helpers/assertLocalSyntheticAuthTarget.mjs";
import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { PLAYBOOK_ROLES, type PlaybookRole } from "@/lib/roles/registry";
import { USER_PATHWAYS } from "@/lib/auth/userPathways";
import { getOnboardingSteps } from "@/lib/onboarding/engine";
import { fillOnboardingField } from "./helpers/fillOnboardingFields";
import type { OnboardingData } from "@/lib/onboarding/types";
import { solveLocalCaptcha } from "./helpers/solveLocalCaptcha";

const fullFields = process.env.PBOS_QA_FULL_ONBOARDING === "YES";
const roles = Object.keys(PLAYBOOK_ROLES) as PlaybookRole[];

for (const role of roles) {
test(`${role}: ${fullFields ? "full-field" : "core"} registration, email verification, onboarding, profile, logout and return login`, async ({ page }) => {
  test.setTimeout(120_000);
  page.setDefaultTimeout(15_000);
  const need = (key: string) => { const value = process.env[key]; if (!value) throw Error(`Missing ${key}`); return value; };
  const appUrl = new URL(need("PLAYWRIGHT_BASE_URL"));
  const supabaseUrl = new URL(need("NEXT_PUBLIC_SUPABASE_URL"));
  if (need("PBOS_ALLOW_SYNTHETIC_AUTH_WRITE") !== "YES" ||
    !["127.0.0.1", "localhost"].includes(appUrl.hostname) ||
    !["127.0.0.1", "localhost"].includes(supabaseUrl.hostname)) {
    throw Error("Only disposable local signup environments are supported");
  }
  assertLocalSyntheticAuthTarget();
  const admin = createClient(supabaseUrl.toString(), need("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const mailBase = new URL(process.env.PBOS_QA_MAIL_URL || "http://127.0.0.1:54324");
  if (!["127.0.0.1", "localhost"].includes(mailBase.hostname) || mailBase.protocol !== "http:") {
    throw Error("Only disposable local mail inboxes are supported");
  }
  const ids: string[] = [];
  try {
    {
      console.log(`[role-confirmation] Beginning ${role}`);
      const email = `pbos-verify-${role}-${randomUUID()}@example.com`;
      const password = `${randomBytes(24).toString("base64url")}Aa1!`;
      await page.goto("/login?mode=signup");
      const pathway = USER_PATHWAYS.find(item => item.role === role);
      if (!pathway) throw Error("Missing registered signup pathway");
      await page.getByRole("button").filter({ has: page.locator("strong").getByText(pathway.label, { exact: true }) }).click();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), { message: "Signup must fit the viewport" }).toBe(true);
      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await solveLocalCaptcha(page);
      const signupResponse = page.waitForResponse(response =>
        new URL(response.url()).pathname === "/auth/v1/signup" && response.request().method() === "POST");
      await page.getByRole("button", { name: "Create Account", exact: true }).click();
      const response = await signupResponse;
      const payload = await response.json() as { id?: string; email_confirmed_at?: string; user?: { id: string; email_confirmed_at?: string } };
      const signup = { user: payload.user ?? (payload.id ? { id: payload.id, email_confirmed_at: payload.email_confirmed_at } : undefined) };
      if (signup.user?.id) ids.push(signup.user.id);
      expect(response.ok()).toBe(true);
      if (!signup.user) throw Error("Signup did not return a disposable identity");
      const userId = signup.user.id;
      expect(signup.user.email_confirmed_at).toBeFalsy();
      await expect(page).toHaveURL(/\/check-email/);
      let confirmationUrl: string | null = null;
      await expect.poll(async () => {
        // Supabase CLI now serves Mailpit; its API differs from legacy Inbucket.
        const listing = await fetch(new URL("/api/v1/messages", mailBase));
        if (!listing.ok) return false;
        const inbox = await listing.json() as {
          messages?: Array<{ ID?: string; id?: string; To?: Array<{ Address?: string }> }>;
        };
        const entry = (inbox.messages || []).find(item =>
          item.To?.some(recipient => recipient.Address?.toLowerCase() === email.toLowerCase())
        );
        if (!entry) return false;
        const id = entry.ID || entry.id;
        if (!id) return false;
        const detail = await fetch(new URL(`/api/v1/message/${encodeURIComponent(id)}`, mailBase));
        if (!detail.ok) return false;
        const message = await detail.json() as { HTML?: string; Text?: string };
        const body = [message.Text, message.HTML].filter(Boolean).join(" ");
        const urls = body.match(/https?:[^\s"'<>]+/g) || [];
        const candidate = urls.map(raw => raw.replace(/&amp;/g, "&").replace(/[),.]+$/, ""))
          .find(raw => raw.includes("/auth/v1/verify") || raw.includes("/auth/callback"));
        if (candidate) {
          // Reject truncated, HTML-corrupted, or cross-project verification links before navigation.
          let parsed: URL;
          try { parsed = new URL(candidate); } catch { return false; }
          if (parsed.origin !== supabaseUrl.origin ||
              parsed.pathname !== "/auth/v1/verify" ||
              parsed.searchParams.get("type") !== "signup" ||
              !parsed.searchParams.get("token")) return false;
          confirmationUrl = parsed.toString();
        }
        return Boolean(confirmationUrl);
      }, { timeout: 20000, intervals: [250, 500, 1000] }).toBe(true);
      if (!confirmationUrl) throw Error(`Confirmation email did not include verification URL for ${role}`);
      await page.goto(confirmationUrl, { waitUntil: "domcontentloaded" });
      try {
        await page.waitForURL(url => url.pathname.startsWith("/start"), {
          waitUntil: "domcontentloaded", timeout: 20000
        });
      } catch {
        const current = new URL(page.url());
        // Do not log callback tokens, email addresses, cookies or sensitive URL query data.
        const status = await admin.auth.admin.getUserById(userId);
        const persisted = await admin.from("profiles")
          .select("role,profile_mode,onboarding_completed")
          .eq("id", userId).maybeSingle();
        const visibleText = (await page.locator("main").first().innerText().catch(() => "")).slice(0, 240);
        throw new Error(`Verification redirect for ${role} did not reach /start: route=${current.pathname}; verified=${Boolean(status.data.user?.email_confirmed_at)}; profile=${persisted.error ? "lookup_error" : persisted.data ? "present" : "missing"}; visible=${visibleText}`);
      }
      expect(page.url()).toContain(`role=${encodeURIComponent(role)}`);
      const user = await admin.auth.admin.getUserById(userId);
      expect(user.error).toBeNull();
      expect(user.data.user?.email_confirmed_at).toBeTruthy();
      const profile = await admin.from("profiles").select("role,profile_mode").eq("id", userId).single();
      expect(profile.error).toBeNull();
      expect(profile.data).toMatchObject({ role, profile_mode: role });
      const expectedAnswers: OnboardingData = {};
      // Full-field mode uses the real widgets; core mode retains optional-step coverage.
      await page.getByLabel("First name", { exact: true }).fill("Journey");
      await page.getByLabel("Last name", { exact: true }).fill("Example");
      const steps = getOnboardingSteps(role);
      for (const [index, step] of steps.entries()) {
        if (fullFields) {
          for (const field of step.fields) {
            const entered = await fillOnboardingField(page, field, userId.replaceAll("-", ""));
            if (entered !== undefined) expectedAnswers[field.key] = entered;
          }
        }
        if (index < steps.length - 1) {
          await page.getByRole("button", { name: fullFields ? "Next Play →" : "Skip for now", exact: true }).click();
        }
      }
      await page.getByRole("checkbox", { name: /I have read and agree/i }).check();
      const completionResponse = page.waitForResponse(response =>
        new URL(response.url()).pathname.startsWith("/api/pbos/onboarding/") && response.request().method() === "POST");
      await page.getByRole("button", { name: "Finish + Create Profile", exact: true }).click();
      const completion = await completionResponse;
      expect(completion.status()).toBe(202);
      const outcome = await completion.json() as { activationState: string };
      expect(outcome.activationState).not.toBe("active");
      const destination = new URL(PLAYBOOK_ROLES[role].osRoute, appUrl).toString();
      await expect(page).toHaveURL(destination, { timeout: 20000 });
      const completed = await admin.from("profiles").select("role,onboarding_completed,onboarding_completed_at,onboarding_data")
        .eq("id", userId).single();
      expect(completed.error).toBeNull();
      expect(completed.data).toMatchObject({ role, onboarding_completed: true,
        onboarding_data: { first_name: "Journey", last_name: "Example", community_safety_agreed: true } });
      expect(completed.data?.onboarding_completed_at).toBeTruthy();
      if (fullFields) {
        expect(completed.data?.onboarding_data).toMatchObject(expectedAnswers);
        if (role === "family") expect(completed.data?.onboarding_data?.child_invite_code ?? "").toBe("");
      }
      await page.reload();
      await expect(page).toHaveURL(destination);
      // All 14 wrong-role completion endpoints must reject before any completion.
      for (const otherRole of roles.filter(other => other !== role)) {
        const endpoint = otherRole === "other" ? "community-partner" : otherRole;
        const denied = await page.request.post(`/api/pbos/onboarding/${endpoint}`, {
          data: { displayName: "Must not apply", goalTitle: "Must not apply" },
        });
        expect(denied.status(), `${role} must not complete ${otherRole}`).toBe(403);
      }
      // Each role probes another role's protected dashboard, then must return to its own.
      const neighbor = roles[(roles.indexOf(role) + 1) % roles.length];
      await page.goto(PLAYBOOK_ROLES[neighbor].osRoute);
      await expect(page).toHaveURL(destination);
      await page.goto("/profile");
      const firstName = page.getByLabel("First name", { exact: true });
      await expect(firstName).toHaveValue("Journey");
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), { message: "Profile editor must fit the viewport" }).toBe(true);
      await firstName.fill("Returned");
      await page.getByRole("button", { name: "Save & verify now", exact: true }).click();
      await expect(page.getByRole("status").filter({ hasText: "Saved and verified." })).toBeVisible();
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
      await expect(page).toHaveURL(destination);
      await page.goto("/profile");
      await expect(firstName).toHaveValue("Returned");
      if (fullFields) {
        const returned = await admin.from("profiles").select("onboarding_data").eq("id", userId).single();
        expect(returned.error).toBeNull();
        expect(returned.data?.onboarding_data).toMatchObject({ ...expectedAnswers, first_name: "Returned" });
        if (role === "family") expect(returned.data?.onboarding_data?.child_invite_code ?? "").toBe("");
        console.log(`[full-field-confirmation] Verified ${role}: ${Object.keys(expectedAnswers).length} configured fields survived profile edit and return login`);
      }
      console.log(`[role-confirmation] Verified ${role}`);
    }
  } finally {
    for (const id of ids) {
      const result = await admin.auth.admin.deleteUser(id);
      if (result.error) throw Error("Isolated signup test account cleanup failed");
    }
  }
});
}
