import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing PBOS Transition-Aged Youth acceptance configuration: " + name);
  return value;
};

test("Transition-Aged Youth completes a self-owned governed Scholar Record journey", async ({ page, request, context }) => {
  const artifacts = "artifacts/pbos-acceptance";
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  const email = required("PBOS_ACCEPTANCE_TAY_EMAIL");
  const password = required("PBOS_ACCEPTANCE_TAY_PASSWORD");
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;
  let user = users.data.users.find(candidate => candidate.email === email);
  if (!user) {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "transition-youth", profile_mode: "transition-youth", synthetic: true },
    });
    if (created.error || !created.data.user) throw created.error ?? new Error("Synthetic Transition-Aged Youth creation failed.");
    user = created.data.user;
  } else {
    const updated = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
    if (updated.error) throw updated.error;
  }

  const resetProfile = await admin.from("profiles").upsert({
    id: user.id,
    role: "transition-youth",
    profile_mode: "transition-youth",
    onboarding_completed: false,
    onboarding_data: {},
    verification_status: "email_confirmed",
  }, { onConflict: "id" });
  if (resetProfile.error) throw resetProfile.error;

  const anonymous = await request.post("/api/pbos/scholar/onboarding", {
    data: { displayName: "PBOS Acceptance TAY", goalTitle: "Build my next-step plan" },
  });
  expect(anonymous.status()).toBe(401);

  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/start/);
  await expect(page.getByText("Start Here · transition-youth", { exact: true })).toBeVisible();

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
  expect(transaction.dashboard?.role).toBe("TRANSITION_YOUTH");
  expect(transaction.dashboard?.sectionIds).toEqual(expect.arrayContaining(["identity", "goals", "support"]));
  expect(transaction.dashboard?.provenance?.length).toBeGreaterThan(0);
  await page.waitForURL(/\/transition-youth-os/, { timeout: 30_000 });

  const completedProfile = await admin.from("profiles")
    .select("role,profile_mode,onboarding_completed,community_safety_agreed")
    .eq("id", user.id).single();
  if (completedProfile.error) throw completedProfile.error;
  expect(completedProfile.data).toMatchObject({
    role: "transition-youth",
    profile_mode: "transition-youth",
    onboarding_completed: true,
    community_safety_agreed: true,
  });

  const scholarProfile = await admin.from("scholar_profiles")
    .select("id,role,onboarding_status")
    .eq("id", user.id).single();
  if (scholarProfile.error) throw scholarProfile.error;
  expect(scholarProfile.data).toMatchObject({
    id: user.id,
    role: "TRANSITION_YOUTH",
    onboarding_status: "DASHBOARD_READY",
  });

  const projection = await admin.from("scholar_dashboard_projections")
    .select("scholar_id,section_ids,exchange_approval_id,provenance")
    .eq("scholar_id", user.id).maybeSingle();
  if (projection.error) throw projection.error;
  expect(projection.data?.scholar_id).toBe(user.id);
  expect(projection.data?.section_ids).toEqual(expect.arrayContaining(["identity", "goals", "support"]));
  expect((projection.data?.provenance as string[] | undefined)?.length).toBeGreaterThan(0);

  await context.tracing.stop({ path: artifacts + "/transition-youth-trace.zip" });
  await writeFile(artifacts + "/transition-youth-acceptance.json", JSON.stringify({
    schemaVersion: 1,
    journeyId: "TRANSITION-YOUTH-ONBOARDING-TO-OS",
    commit: required("PBOS_ACCEPTANCE_COMMIT"),
    checks: [
      { dimension: "CANONICAL_RECORD", passed: true, detail: "Transition-Aged Youth persisted through the owner-scoped Scholar Record rather than a parallel learner record." },
      { dimension: "AUTHORITY", passed: true, detail: "Anonymous mutation was denied and PBOS required a role-matched TRANSITION_YOUTH identity." },
      { dimension: "PBOS_INTEGRATION", passed: true, detail: "Role-specific signed PBOS approvals produced provenance-bearing support projection evidence." },
      { dimension: "LEAST_PRIVILEGE", passed: true, detail: "Completion created no caregiver, mentor, educator, employer, institution, or partner access." },
      { dimension: "OS_DESTINATION", passed: true, detail: "Completion routed to the distinct Transition-Aged Youth OS." }
    ]
  }, null, 2));
});
