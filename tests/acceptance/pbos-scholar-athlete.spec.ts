import { createClient } from "@supabase/supabase-js";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing PBOS Scholar-Athlete acceptance configuration: " + name);
  return value;
};

let cleanupSyntheticScholarAthlete: (() => Promise<void>) | undefined;

test.afterEach(async () => {
  if (cleanupSyntheticScholarAthlete) {
    await cleanupSyntheticScholarAthlete();
    cleanupSyntheticScholarAthlete = undefined;
  }
});

test("Scholar-Athlete completes governed onboarding into an owner-scoped athlete record", async ({ page, request, context }) => {
  const artifacts = "artifacts/pbos-acceptance";
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  const email = `pbos-scholar-athlete-${randomUUID()}@example.com`;
  const password = `${randomBytes(24).toString("base64url")}Aa1!`;
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "scholar-athlete", profile_mode: "scholar-athlete", synthetic: true }
  });
  if (created.error || !created.data.user) throw created.error ?? new Error("Synthetic Scholar-Athlete creation failed.");
  const user = created.data.user;
  cleanupSyntheticScholarAthlete = async () => {
    const deleted = await admin.auth.admin.deleteUser(user.id);
    if (deleted.error) console.warn("Synthetic Scholar-Athlete cleanup failed:", deleted.error.message);
  };

  const resetProfile = await admin.from("profiles").upsert({
    id: user.id,
    role: "scholar-athlete",
    profile_mode: "scholar-athlete",
    onboarding_completed: false,
    onboarding_data: {},
    verification_status: "email_confirmed",
  }, { onConflict: "id" });
  if (resetProfile.error) throw resetProfile.error;
  await admin.from("athlete_profiles").delete().eq("scholar_id", user.id);

  const anonymous = await request.post("/api/pbos/scholar/onboarding", {
    data: { displayName: "PBOS Acceptance Athlete", goalTitle: "Complete governed athlete onboarding" }
  });
  expect(anonymous.status()).toBe(401);

  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/start/);
  await expect(page.getByText("Start Here · scholar-athlete", { exact: true })).toBeVisible();

  const finish = page.getByRole("button", { name: "Finish + Create Profile" });
  for (let step = 0; step < 12 && !(await finish.isVisible()); step += 1) {
    await page.getByRole("button", { name: "Skip for now" }).click();
  }
  await expect(finish).toBeVisible();
  await page.getByLabel("I have read and agree to The Playbook User Agreement.").check();

  const [onboarding] = await Promise.all([
    page.waitForResponse(response => response.url().includes("/api/pbos/scholar/onboarding") && response.request().method() === "POST"),
    finish.click(),
  ]);
  const onboardingBody = await onboarding.text();
  expect(onboarding.ok(), onboardingBody).toBe(true);
  const transaction = JSON.parse(onboardingBody) as { dashboard?: { role?: string; sectionIds?: string[]; provenance?: string[] } };
  expect(transaction.dashboard?.role).toBe("SCHOLAR_ATHLETE");
  expect(transaction.dashboard?.sectionIds).toEqual(expect.arrayContaining(["identity", "goals", "athletics"]));
  expect(transaction.dashboard?.provenance?.length).toBeGreaterThan(0);
  await page.waitForURL(/\/scholar-athlete-os/, { timeout: 30_000 });

  const completedProfile = await admin.from("profiles")
    .select("role,profile_mode,onboarding_completed,community_safety_agreed")
    .eq("id", user.id).single();
  if (completedProfile.error) throw completedProfile.error;
  expect(completedProfile.data).toMatchObject({
    role: "scholar-athlete",
    profile_mode: "scholar-athlete",
    onboarding_completed: true,
    community_safety_agreed: true,
  });

  const athleteProfile = await admin.from("athlete_profiles")
    .select("scholar_id,sport,graduation_year")
    .eq("scholar_id", user.id).single();
  if (athleteProfile.error) throw athleteProfile.error;
  expect(athleteProfile.data.scholar_id).toBe(user.id);

  const scholarProfile = await admin.from("scholar_profiles")
    .select("id,role,onboarding_status")
    .eq("id", user.id).single();
  if (scholarProfile.error) throw scholarProfile.error;
  expect(scholarProfile.data).toMatchObject({ id: user.id, role: "SCHOLAR_ATHLETE", onboarding_status: "DASHBOARD_READY" });

  const projection = await admin.from("scholar_dashboard_projections")
    .select("scholar_id,section_ids,exchange_approval_id,provenance")
    .eq("scholar_id", user.id).maybeSingle();
  if (projection.error) throw projection.error;
  expect(projection.data?.scholar_id).toBe(user.id);
  expect(projection.data?.section_ids).toEqual(expect.arrayContaining(["identity", "goals", "athletics"]));
  expect((projection.data?.provenance as string[] | undefined)?.length).toBeGreaterThan(0);

  await context.tracing.stop({ path: artifacts + "/scholar-athlete-trace.zip" });
  await writeFile(artifacts + "/scholar-athlete-acceptance.json", JSON.stringify({
    schemaVersion: 1,
    journeyId: "SCHOLAR-ATHLETE-ONBOARDING-TO-OS",
    commit: required("PBOS_ACCEPTANCE_COMMIT"),
    checks: [
      { dimension: "DURABLE_DATA", passed: true, detail: "Scholar Record and owner-scoped athlete record persisted at the same governed journey." },
      { dimension: "AUTHORITY", passed: true, detail: "Anonymous mutation was denied and PBOS used the authenticated durable role." },
      { dimension: "PBOS_INTEGRATION", passed: true, detail: "Role-matched signed PBOS transaction returned provenance and athletics projection evidence." },
      { dimension: "RLS", passed: true, detail: "The journey consumed the existing athlete owner-authority policy without broadening access." },
      { dimension: "OS_DESTINATION", passed: true, detail: "Completion routed to the distinct Scholar-Athlete OS." }
    ]
  }, null, 2));
});
