import { randomBytes, randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { getOnboardingSteps } from "@/lib/onboarding/engine";
import { PLAYBOOK_ROLES } from "@/lib/roles/registry";
import { USER_PATHWAYS } from "@/lib/auth/userPathways";
import { assertLocalSyntheticAuthTarget } from "./helpers/assertLocalSyntheticAuthTarget.mjs";
import { solveLocalCaptcha } from "./helpers/solveLocalCaptcha";

test.use({ trace: "off", video: "off", screenshot: "off" });

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing ${key}`);
  return value;
}

async function captureConfirmation(email: string, db: URL, app: URL): Promise<string> {
  const mail = new URL(required("PBOS_QA_MAIL_URL"));
  if (mail.href !== "http://127.0.0.1:54324/") throw new Error("Only the disposable Mailpit inbox is accepted");
  let confirmation = "";
  await expect.poll(async () => {
    const listing = await fetch(new URL("/api/v1/messages", mail), { redirect: "error" });
    if (!listing.ok) return false;
    const inbox = await listing.json() as { messages?: { ID: string; To?: { Address: string }[] }[] };
    const entry = inbox.messages?.find(item => item.To?.some(recipient => recipient.Address === email));
    if (!entry) return false;
    const detail = await fetch(new URL(`/api/v1/message/${encodeURIComponent(entry.ID)}`, mail), { redirect: "error" });
    if (!detail.ok) return false;
    const message = await detail.json() as { HTML?: string; Text?: string };
    const links = [message.Text, message.HTML].join(" ").match(/https?:[^\s"'<>]+/g) ?? [];
    for (const link of links) {
      const url = new URL(link.replaceAll("&amp;", "&").replace(/[),.]+$/, ""));
      if (url.origin !== db.origin || url.username || url.password || url.pathname !== "/auth/v1/verify" ||
          url.searchParams.get("type") !== "signup" || !url.searchParams.get("token")) continue;
      const redirect = url.searchParams.get("redirect_to");
      if (!redirect || new URL(redirect).origin !== app.origin) continue;
      confirmation = url.href;
      return true;
    }
    return false;
  }, { timeout: 25000 }).toBe(true);
  return confirmation;
}

test("registered Scholar verifies locally and returns to the persisted Scholar profile", async ({ page, context }) => {
  test.setTimeout(180_000);
  const evidenceFile = required("PBOS_QA_JOURNEY_FILE");
  const app = new URL(required("PLAYWRIGHT_BASE_URL"));
  const db = new URL(required("NEXT_PUBLIC_SUPABASE_URL"));
  const evidence: Record<string, { status: "PASS" | "FAIL" | "BLOCKED"; detail: string }> = {};
  const record = async (step: string, status: "PASS" | "FAIL" | "BLOCKED", detail: string) => {
    evidence[step] = { status, detail };
    await writeFile(evidenceFile, JSON.stringify(evidence));
  };
  const step = async (name: string, detail: string, work: () => Promise<void>) => {
    try {
      await work();
      await record(name, "PASS", detail);
    } catch {
      await record(name, "FAIL", `Assertion failed while checking this evidence. ${detail}`);
      throw new Error(`Trusted Scholar assertion failed at ${name}`);
    }
  };

  assertLocalSyntheticAuthTarget();
  const admin = createClient(db.origin, required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    const captcha = url.protocol === "https:" && (url.hostname === "hcaptcha.com" || url.hostname.endsWith(".hcaptcha.com"));
    return url.origin === app.origin || url.origin === db.origin || captcha ? route.continue() : route.abort();
  });
  const email = `pbos-scholar-${randomUUID()}@example.com`;
  const password = `${randomBytes(24).toString("base64url")}Aa1!`;
  let userId = "";
  const login = async () => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await solveLocalCaptcha(page);
    await page.getByRole("button", { name: "Log In", exact: true }).click();
  };

  await step("registration", "Browser signup returned a new unconfirmed identity and displayed check-email.", async () => {
    await page.goto("/login?mode=signup");
    const pathway = USER_PATHWAYS.find(item => item.role === "scholar")!;
    await page.getByRole("button").filter({ has: page.locator("strong").getByText(pathway.label, { exact: true }) }).click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await solveLocalCaptcha(page);
    const pending = page.waitForResponse(response => new URL(response.url()).origin === db.origin &&
      new URL(response.url()).pathname === "/auth/v1/signup" && response.request().method() === "POST");
    await page.getByRole("button", { name: "Create Account", exact: true }).click();
    const response = await pending;
    expect(response.ok()).toBe(true);
    const result = await response.json();
    const user = result.user ?? result;
    expect(user.id).toBeTruthy();
    expect(user.email_confirmed_at).toBeFalsy();
    userId = user.id;
    await expect(page).toHaveURL(/\/check-email/);
  });
  await step("verification", "The same recipient's local Mailpit link verified the account and bound the Scholar role.", async () => {
    const confirmation = await captureConfirmation(email, db, app);
    await page.goto(confirmation, { waitUntil: "domcontentloaded" });
    await page.waitForURL(url => url.origin === app.origin && url.pathname === "/start");
    const { data, error } = await admin.auth.admin.getUserById(userId);
    expect(error).toBeNull();
    expect(data.user?.email_confirmed_at).toBeTruthy();
    const profile = await admin.from("profiles").select("role,profile_mode").eq("id", userId).single();
    expect(profile.error).toBeNull();
    expect(profile.data).toEqual({ role: "scholar", profile_mode: "scholar" });
  });
  await step("login", "Password login entered onboarding after discarding the verification browser session.", async () => {
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
    await context.clearCookies();
    await login();
    await expect(page).toHaveURL(/\/start/);
  });
  let activationState = "";
  await step("onboarding", "The real completion endpoint wrote the Scholar profile and its completion timestamp.", async () => {
    await page.getByLabel("First name", { exact: true }).fill("Journey");
    await page.getByLabel("Last name", { exact: true }).fill("Example");
    const count = getOnboardingSteps("scholar").length;
    for (let index = 1; index < count; index++) {
      await page.getByRole("button", { name: "Skip for now", exact: true }).click();
    }
    await page.getByRole("checkbox", { name: /I have read and agree/i }).check();
    const pending = page.waitForResponse(response => new URL(response.url()).pathname === "/api/pbos/onboarding/scholar" &&
      response.request().method() === "POST");
    await page.getByRole("button", { name: "Finish + Create Profile", exact: true }).click();
    const response = await pending;
    expect([200, 202]).toContain(response.status());
    activationState = (await response.json()).activationState;
    const profile = await admin.from("profiles").select("role,onboarding_completed,onboarding_completed_at,onboarding_data")
      .eq("id", userId).single();
    expect(profile.error).toBeNull();
    expect(profile.data).toMatchObject({ role: "scholar", onboarding_completed: true,
      onboarding_data: { first_name: "Journey", last_name: "Example", community_safety_agreed: true } });
    expect(profile.data?.onboarding_completed_at).toBeTruthy();
  });
  if (activationState === "pending-pbos-activation") {
    await record("activation", "BLOCKED", "The app reported pending PBOS activation. No connector authority was supplied.");
  } else {
    await record("activation", "FAIL", "The disposable app returned an unexpected activation state without connector authority.");
  }
  await step("dashboard", "The Scholar dashboard route and its Scholar-specific surface rendered.", async () => {
    await expect(page).toHaveURL(new URL("/dashboard", app).href);
    await expect(page.getByTestId("scholar-dashboard-canon")).toBeVisible();
    await page.screenshot({ path: "artifacts/trusted-local-scholar/dashboard.png" });
  });
  await step("cross-role-denial", "All other role completion endpoints returned 403 and the Family OS denied navigation.", async () => {
    for (const role of Object.keys(PLAYBOOK_ROLES).filter(role => role !== "scholar")) {
      const endpoint = role === "other" ? "community-partner" : role;
      const denied = await page.request.post(`/api/pbos/onboarding/${endpoint}`, {
        data: { displayName: "Must not apply" },
      });
      expect(denied.status()).toBe(403);
    }
    await page.goto(PLAYBOOK_ROLES.family.osRoute);
    await expect(page).toHaveURL(new URL("/dashboard", app).href);
  });
  const firstName = page.getByLabel("First name", { exact: true });
  await step("profile-save", "Editing the private profile persisted through the save response and a reload.", async () => {
    await page.goto("/profile");
    await expect(firstName).toHaveValue("Journey");
    await firstName.fill("Returned");
    await page.getByRole("button", { name: "Save & verify now", exact: true }).click();
    await expect(page.getByRole("status").filter({ hasText: "Saved and verified." })).toBeVisible();
    await page.reload();
    await expect(firstName).toHaveValue("Returned");
  });
  await step("logout", "Sign out ended dashboard access and redirected the browser to login.", async () => {
    await page.getByRole("button", { name: "Sign out", exact: true }).filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
  await step("return-login", "The same verified account logged in again and landed directly in Scholar OS.", async () => {
    await login();
    await expect(page).toHaveURL(new URL("/dashboard", app).href);
  });
  await step("persistence", "The edited first name persisted in the UI and the same database profile after return login.", async () => {
    await page.goto("/profile");
    await expect(firstName).toHaveValue("Returned");
    const saved = await admin.from("profiles").select("role,onboarding_completed,onboarding_data").eq("id", userId).single();
    expect(saved.error).toBeNull();
    expect(saved.data).toMatchObject({ role: "scholar", onboarding_completed: true,
      onboarding_data: { first_name: "Returned" } });
  });
  expect(evidence.activation?.status).toBe("BLOCKED");
});
