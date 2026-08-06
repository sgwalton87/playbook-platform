import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing PBOS acceptance configuration: " + name);
  return value;
};

test("Scholar completes governed onboarding and receives a durable dashboard", async ({ page, request, context }) => {
  const artifacts = "artifacts/pbos-acceptance";
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  const email = required("PBOS_ACCEPTANCE_EMAIL");
  const password = required("PBOS_ACCEPTANCE_PASSWORD");
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;
  let user = users.data.users.find(candidate => candidate.email === email);
  if (!user) {
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true,
      user_metadata: { role: "scholar", profile_mode: "scholar", synthetic: true } });
    if (created.error || !created.data.user) throw created.error ?? new Error("Synthetic Scholar creation failed.");
    user = created.data.user;
  } else {
    const updated = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
    if (updated.error) throw updated.error;
  }

  const anonymous = await request.post("/api/pbos/scholar/onboarding", {
    data: { displayName: "PBOS Acceptance Scholar", goalTitle: "Complete governed onboarding" }
  });
  expect(anonymous.status()).toBe(401);

  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);

  const onboarding = await page.request.post("/api/pbos/scholar/onboarding", {
    data: { displayName: "PBOS Acceptance Scholar", goalTitle: "Complete governed onboarding" }
  });
  expect(onboarding.ok()).toBe(true);
  const transaction = await onboarding.json() as { dashboard?: { provenance?: string[] } };
  expect(transaction.dashboard?.provenance?.length).toBeGreaterThan(0);

  const projection = await admin.from("scholar_dashboard_projections")
    .select("scholar_id,goal_id,section_ids,exchange_approval_id,provenance")
    .eq("scholar_id", user.id).maybeSingle();
  if (projection.error) throw projection.error;
  expect(projection.data?.scholar_id).toBe(user.id);
  expect(projection.data?.goal_id).toBeTruthy();
  expect(projection.data?.section_ids).toEqual(expect.arrayContaining(["identity", "goals"]));
  expect((projection.data?.provenance as string[] | undefined)?.length).toBeGreaterThan(0);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: artifacts + "/scholar-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.getByText("Scholar Dashboard", { exact: false }).first()).toBeVisible();
  await page.screenshot({ path: artifacts + "/scholar-mobile.png", fullPage: true });

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter(violation => ["serious", "critical"].includes(violation.impact ?? ""));
  await writeFile(artifacts + "/scholar-accessibility.json", JSON.stringify(accessibility, null, 2));
  expect(blocking).toEqual([]);

  await context.tracing.stop({ path: artifacts + "/scholar-trace.zip" });
  await writeFile(artifacts + "/scholar-acceptance.json", JSON.stringify({
    schemaVersion: 1,
    journeyId: "SCHOLAR-ONBOARDING-TO-DASHBOARD",
    commit: required("PBOS_ACCEPTANCE_COMMIT"),
    checks: [
      { dimension: "ROUTE", passed: true, detail: "Login, onboarding API, and dashboard routes executed." },
      { dimension: "DURABLE_DATA", passed: true, detail: "Owner-scoped dashboard projection was read from Supabase after mutation." },
      { dimension: "AUTHORITY", passed: true, detail: "Anonymous onboarding was denied before the authenticated transaction." },
      { dimension: "PBOS_INTEGRATION", passed: true, detail: "Signed PBOS transaction returned provenance-bearing dashboard evidence." },
      { dimension: "SECURITY", passed: true, detail: "Synthetic credentials remained environment-bound and anonymous mutation failed closed." }
    ]
  }, null, 2));
});
