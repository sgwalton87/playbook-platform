import { PLAYBOOK_ROLES } from "@/lib/roles/registry";
import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { solveLocalCaptcha } from "./helpers/solveLocalCaptcha";

test("synthetic profile data survives edit and reload", async ({ page }) => {
  const need = (key: string) => { const val = process.env[key]; if (!val) throw new Error(`Missing ${key}`); return val; };
  const target = new URL(need("PLAYWRIGHT_BASE_URL"));
  if (!(target.hostname === "localhost" || target.hostname === "127.0.0.1" || target.hostname.endsWith("-preview.vercel.app"))) {
    throw new Error("Run only against an isolated preview environment");
  }
  if (need("PBOS_ALLOW_SYNTHETIC_AUTH_WRITE") !== "YES") throw new Error("Explicit QA account creation approval required");
  const supabaseUrl = new URL(need("NEXT_PUBLIC_SUPABASE_URL"));
  if (supabaseUrl.hostname === "oexgxnybeixwadgtdtzp.supabase.co") {
    throw new Error("Production Supabase project is forbidden for this synthetic test");
  }
  const admin = createClient(supabaseUrl.toString(), need("SUPABASE_SERVICE_ROLE_KEY"), {
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
        activities: [{ activity: "Service learning", category: "Service", hours: "15", supervisor: "Advisor", description: "Community tutoring" }], top_schools: ["Princeton"] } }, { onConflict: "id" });
    if (seed.error) throw seed.error;
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await solveLocalCaptcha(page);
    await page.getByRole("button", { name: "Log In", exact: true }).click();
    await page.waitForURL(url => url.pathname !== "/login", { timeout: 15000 });
    await page.goto("/profile");
    await expect(page).toHaveURL(url => url.pathname === "/profile");
    await expect(page.getByRole("heading", { name: "Map your academic path." })).toBeVisible();
    const stalePage = await page.context().newPage();
    await stalePage.goto("/profile");
    await expect(stalePage.getByLabel("Current high school / institution", { exact: true })).toBeVisible();
    const school = page.getByLabel("Current high school / institution", { exact: true });
    await expect(school).toBeVisible();
    await school.fill("Recovery Institute");
    const firstCollege = page.getByLabel("1. College", { exact: true });
    await expect(firstCollege).toHaveValue("Princeton");
    await firstCollege.fill("Stanford University");
    await page.getByRole("button", { name: /save changes/i }).first().click();
    await page.waitForTimeout(400);
    const saveAlerts = (await page.getByRole("alert").allTextContents()).map(text => text.trim()).filter(Boolean);
    if (saveAlerts.length) throw new Error(`Profile save reported: ${saveAlerts.join(" | ")}`);
    await expect.poll(async () => {
      const row = await admin.from("profiles").select("school").eq("id", id).single();
      return row.data?.school;
    }).toBe("Recovery Institute");
    await page.reload();
    await expect(page.getByRole("heading", { name: "Map your academic path." })).toBeVisible();
    await expect(page.getByLabel("Activity").first()).toHaveValue("Service learning");
    await expect(page.getByLabel("Mentor / Supervisor").first()).toHaveValue("Advisor");
    await expect(page.getByLabel("Description").first()).toHaveValue("Community tutoring");
    await expect(page.getByLabel("Current high school / institution", { exact: true })).toHaveValue("Recovery Institute");
    await expect(page.getByLabel("1. College", { exact: true })).toHaveValue("Stanford University");
    // The athlete and recruiting fields now live in their dedicated modern
    // module, but must share the exact same canonical onboarding snapshot.
    await page.goto("/profile/athlete");
    await expect(page.getByLabel("Primary sport", { exact: true })).toHaveValue("Basketball");
    await expect(page.getByLabel("Current team / club", { exact: true })).toHaveValue("Recovery Club");
    await page.getByLabel("Current team / club", { exact: true }).fill("Recovery Club Updated");
    await page.getByRole("button", { name: "Save Changes", exact: true }).click();
    await expect(page.getByText(/Saved and verified/)).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Current team / club", { exact: true })).toHaveValue("Recovery Club Updated");
    await page.goto("/profile");
    await expect(page.getByLabel("Current high school / institution", { exact: true })).toHaveValue("Recovery Institute");
    await stalePage.getByLabel("Current high school / institution", { exact: true }).fill("Stale Academy");
    await stalePage.getByRole("button", { name: /save changes/i }).first().click();
    await expect(stalePage.getByText("Your profile was updated elsewhere. Reload to review those changes before saving.")).toBeVisible();
    const stillSaved = await admin.from("profiles").select("school,onboarding_data").eq("id", id).single();
    expect(stillSaved.error).toBeNull();
    expect(stillSaved.data?.school).toBe("Recovery Institute");
    expect(stillSaved.data?.onboarding_data).toMatchObject({ school: "Recovery Institute", top_schools: ["Stanford University"] });
    await stalePage.close();
    const check = await admin.from("profiles").select("onboarding_data").eq("id", id).single();
    expect(check.data?.onboarding_data).toMatchObject({ school: "Recovery Institute",
      activities: [{ activity: "Service learning", category: "Service", hours: "15", supervisor: "Advisor", description: "Community tutoring" }], top_schools: ["Stanford University"], primary_sport: "Basketball", current_team: "Recovery Club Updated" });
  } finally {
    const cleanup = await admin.auth.admin.deleteUser(id);
    if (cleanup.error) console.warn("Synthetic user cleanup needs operator follow-up");
  }
});

test("Family account sees Family onboarding and edits its own saved profile without losing other answers", async ({ page }) => {
  const need = (key: string) => { const value = process.env[key]; if (!value) throw Error(`Missing ${key}`); return value; };
  const base = new URL(need("PLAYWRIGHT_BASE_URL"));
  const db = new URL(need("NEXT_PUBLIC_SUPABASE_URL"));
  if (need("PBOS_ALLOW_SYNTHETIC_AUTH_WRITE") !== "YES" ||
      !["localhost", "127.0.0.1"].includes(base.hostname) ||
      db.hostname === "oexgxnybeixwadgtdtzp.supabase.co") {
    throw Error("Family synthetic test requires isolated local environment");
  }
  const admin = createClient(db.toString(), need("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const email = `pbos-family-${randomUUID()}@example.com`;
  const password = `${randomBytes(24).toString("base64url")}Aa1!`;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true,
    user_metadata: { role: "family", profile_mode: "family", synthetic: true } });
  if (created.error || !created.data.user) throw created.error || Error("No test user returned");
  const id = created.data.user.id;
  try {
    const seed = await admin.from("profiles").upsert({
      id, role: "family", profile_mode: "family", requested_role: "family",
      onboarding_completed: true, verification_status: "email_confirmed",
      first_name: "Test", last_name: "Parent",
      onboarding_data: {
        first_name: "Test", last_name: "Parent", full_name: "Test Parent",
        relationship_to_scholar: "Parent", dependent_name: "Existing Scholar",
        family_focus: ["Academic monitoring"], private_planning_note: "Keep unchanged"
      }
    }, { onConflict: "id" });
    if (seed.error) throw seed.error;
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await solveLocalCaptcha(page);
    await page.getByRole("button", { name: "Log In", exact: true }).click();
    await page.waitForURL(url => url.pathname !== "/login", { timeout: 15000 });

    await page.goto("/start?first=1&role=family");
    await expect(page.getByText("Create your Parent / Guardian profile.", { exact: true })).toBeVisible();
    await expect(page.getByText("Create your Scholar-Athlete profile.", { exact: true })).toHaveCount(0);

    await page.goto("/profile");
    await expect(page).toHaveURL(url => url.pathname === "/profile");
    await expect(page.getByRole("heading", { name: "Family OS · My Profile", exact: true })).toBeVisible();
    await expect(page.getByLabel("Relationship to scholar")).toHaveValue("Parent");
    await page.getByLabel("Relationship to scholar").selectOption("Guardian");
    await page.getByRole("button", { name: "Save Changes", exact: true }).click();
    await expect.poll(async () => {
      const record = await admin.from("profiles").select("onboarding_data").eq("id", id).single();
      return record.data?.onboarding_data?.relationship_to_scholar;
    }).toBe("Guardian");
    await page.reload();
    await expect(page.getByLabel("Relationship to scholar")).toHaveValue("Guardian");
    // Direct URL access cannot grant this Family member Scholar-Athlete authority.
    await page.goto("/scholar-athlete-os");
    await page.waitForURL(url => url.pathname === "/family-os", { timeout: 15000 });
    await page.goto("/brand-partner-os");
    await page.waitForURL(url => url.pathname === "/family-os", { timeout: 15000 });
    await expect(page.getByRole("heading", { name: /Scholar-Athlete/i })).toHaveCount(0);
    const finalRecord = await admin.from("profiles").select("role,profile_mode,onboarding_data").eq("id", id).single();
    expect(finalRecord.data).toMatchObject({
      role: "family", profile_mode: "family",
      onboarding_data: {
        relationship_to_scholar: "Guardian",
        dependent_name: "Existing Scholar",
        family_focus: ["Academic monitoring"],
        private_planning_note: "Keep unchanged",
      },
    });
  } finally {
    const cleanup = await admin.auth.admin.deleteUser(id);
    if (cleanup.error) console.warn("Synthetic Family cleanup needs operator follow-up");
  }
});

const nonScholarRoles = [
  "family", "transition-youth", "mentor", "educator", "high-school-counselor",
  "coach", "college-coach", "college-admissions", "brand-partner",
  "employer", "district", "athlete-abroad", "other",
] as const;

for (const role of nonScholarRoles) {
  test(`${role} profile uses the role contract and persists an editable identity`, async ({ page }) => {
  const need = (key: string) => { const v = process.env[key]; if (!v) throw Error(`Missing ${key}`); return v; };
  const base = new URL(need("PLAYWRIGHT_BASE_URL"));
  const db = new URL(need("NEXT_PUBLIC_SUPABASE_URL"));
  if (need("PBOS_ALLOW_SYNTHETIC_AUTH_WRITE") !== "YES" ||
      !["localhost", "127.0.0.1"].includes(base.hostname) ||
      db.hostname === "oexgxnybeixwadgtdtzp.supabase.co") {
    throw Error("Role journey requires isolated local QA");
  }
  const admin = createClient(db.toString(), need("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const email = `pbos-${role}-${randomUUID()}@example.com`;
  const password = `${randomBytes(24).toString("base64url")}Aa1!`;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true,
    user_metadata: { role, profile_mode: role, synthetic: true } });
  if (created.error || !created.data.user) throw created.error || Error("Synthetic user not created");
  const id = created.data.user.id;
  try {
    const seed = await admin.from("profiles").upsert({
      id, role, profile_mode: role, requested_role: role,
      onboarding_completed: true, verification_status: "email_confirmed",
      first_name: "Role", last_name: "Before",
      onboarding_data: {
        first_name: "Role", last_name: "Before", full_name: "Role Before",
        private_test_marker: "preserve", community_safety_agreed: true
      }
    }, { onConflict: "id" });
    if (seed.error) throw seed.error;
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await solveLocalCaptcha(page);
    await page.getByRole("button", { name: "Log In", exact: true }).click();
    await page.waitForURL(url => url.pathname !== "/login", { timeout: 15000 });
    await page.goto("/profile");
    await expect(page).toHaveURL(url => url.pathname === "/profile");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByLabel("Last name", { exact: true })).toHaveValue("Before");
    await page.getByLabel("Last name", { exact: true }).fill("After");
    await page.getByRole("button", { name: "Save Changes", exact: true }).click();
    await expect.poll(async () => {
      const result = await admin.from("profiles").select("last_name,onboarding_data").eq("id", id).single();
      return result.data?.last_name;
    }).toBe("After");
    await page.reload();
    await expect(page.getByLabel("Last name", { exact: true })).toHaveValue("After");
    // Every role must land in its own OS route after profile completion.
    const expectedOS = PLAYBOOK_ROLES[role].osRoute;
    await page.goto(expectedOS);
    await expect(page).toHaveURL(new URL(expectedOS, base).toString());
    const final = await admin.from("profiles").select("role,profile_mode,onboarding_data").eq("id", id).single();
    expect(final.data).toMatchObject({
      role, profile_mode: role,
      onboarding_data: { last_name: "After", private_test_marker: "preserve", community_safety_agreed: true },
    });
  } finally {
    const cleanup = await admin.auth.admin.deleteUser(id);
    if (cleanup.error) console.warn("Synthetic role cleanup needs operator follow-up");
  }
  });
}


test("Family and Brand Partner cannot read or modify each other's private profile rows", async () => {
  const need = (key: string) => { const v = process.env[key]; if (!v) throw Error(`Missing ${key}`); return v; };
  const base = new URL(need("PLAYWRIGHT_BASE_URL"));
  const db = new URL(need("NEXT_PUBLIC_SUPABASE_URL"));
  if (need("PBOS_ALLOW_SYNTHETIC_AUTH_WRITE") !== "YES" ||
      !["localhost", "127.0.0.1"].includes(base.hostname) ||
      db.hostname === "oexgxnybeixwadgtdtzp.supabase.co") {
    throw Error("Cross-account RLS test may run only against isolated local Supabase");
  }
  const admin = createClient(db.toString(), need("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const anon = need("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const users: Array<{ id: string; email: string; password: string; role: string }> = [];
  try {
    for (const role of ["family", "brand-partner"]) {
      const email = `pbos-rls-${role}-${randomUUID()}@example.com`;
      const password = `${randomBytes(24).toString("base64url")}Aa1!`;
      const created = await admin.auth.admin.createUser({ email, password, email_confirm: true,
        user_metadata: { role, profile_mode: role, synthetic: true } });
      if (created.error || !created.data.user) throw created.error || Error("Synthetic account creation failed");
      const id = created.data.user.id;
      users.push({ id, email, password, role });
      const seed = await admin.from("profiles").upsert({ id, role, profile_mode: role,
        onboarding_completed: true, verification_status: "email_confirmed",
        onboarding_data: { private_test_marker: `owner-${role}` }
      }, { onConflict: "id" });
      if (seed.error) throw seed.error;
    }
    for (const actor of users) {
      const other = users.find(u => u.id !== actor.id)!;
      const client = createClient(db.toString(), anon, { auth: { persistSession: false, autoRefreshToken: false } });
      const login = await client.auth.signInWithPassword({ email: actor.email, password: actor.password });
      if (login.error) throw login.error;
      const own = await client.from("profiles").select("id,onboarding_data").eq("id", actor.id).maybeSingle();
      expect(own.error).toBeNull();
      expect(own.data?.onboarding_data).toMatchObject({ private_test_marker: `owner-${actor.role}` });
      const foreign = await client.from("profiles").select("id,onboarding_data").eq("id", other.id).maybeSingle();
      expect(foreign.error).toBeNull();
      expect(foreign.data).toBeNull();
      const attempted = await client.from("profiles").update({ bio: "Unauthorised write" })
        .eq("id", other.id).select("id");
      expect(attempted.error).toBeNull();
      expect(attempted.data).toEqual([]);
      const verified = await admin.from("profiles").select("bio,onboarding_data").eq("id", other.id).single();
      expect(verified.error).toBeNull();
      expect(verified.data?.bio).not.toBe("Unauthorised write");
      expect(verified.data?.onboarding_data).toMatchObject({ private_test_marker: `owner-${other.role}` });
      await client.auth.signOut();
    }
  } finally {
    for (const u of users) {
      const cleanup = await admin.auth.admin.deleteUser(u.id);
      if (cleanup.error) console.warn("Synthetic RLS account cleanup needs operator follow-up");
    }
  }
});
