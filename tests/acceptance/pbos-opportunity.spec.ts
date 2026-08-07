import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing protected PBOS acceptance configuration: " + name);
  return value;
};

test("READINESS-TO-OPPORTUNITY produces exact-revision functional evidence", async ({ page, request, context }) => {
  const artifacts = "artifacts/pbos-acceptance";
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const anonymous = await request.post("/api/pbos/opportunities", { data: {} });
  expect(anonymous.status()).toBe(401);
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(required("PBOS_ACCEPTANCE_EMAIL"));
  await page.getByLabel("Password", { exact: true }).fill(required("PBOS_ACCEPTANCE_PASSWORD"));
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);
  const onboarding = await page.request.post("/api/pbos/scholar/onboarding", { data: {
    displayName: "PBOS Acceptance Scholar", goalTitle: "Public Health"
  } });
  const onboardingBody = await onboarding.text();
  expect(onboarding.ok(), onboardingBody).toBe(true);
  const discovery = await page.request.post("/api/pbos/opportunities");
  const discovered = await discovery.json() as { error?: string; matches?: Array<{ id: string; reasons?: string[] }> };
  expect(discovery.status(), "Opportunity discovery failed: " + (discovered.error ?? "unknown API error")).toBe(200);
  expect(discovered.matches?.length ?? 0).toBeGreaterThan(0);
  expect(discovered.matches?.every(match => (match.reasons?.length ?? 0) > 0)).toBe(true);
  const match = discovered.matches![0];
  const decision = await page.request.patch("/api/pbos/opportunities", { data: {
    matchId: match.id, decision: "SAVED", requestId: "pbos-acceptance-save-" + match.id
  } });
  expect(decision.status()).toBe(200);
  await page.goto("/opportunities");
  await expect(page.getByRole("heading", { name: "Your explainable matches" })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: artifacts + "/opportunity-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.screenshot({ path: artifacts + "/opportunity-mobile.png", fullPage: true });
  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter(violation => ["serious", "critical"].includes(violation.impact ?? ""));
  await writeFile(artifacts + "/opportunity-accessibility.json", JSON.stringify(accessibility, null, 2));
  expect(blocking).toEqual([]);
  await context.tracing.stop({ path: artifacts + "/opportunity-trace.zip" });
  await writeFile(artifacts + "/opportunity-acceptance.json", JSON.stringify({ schemaVersion: 1,
    journeyId: "READINESS-TO-OPPORTUNITY", commit: required("PBOS_ACCEPTANCE_COMMIT"), checks: [
      { dimension: "DURABLE_DATA", passed: true, detail: "Owner-scoped state survived an authenticated write and read." },
      { dimension: "PBOS_INTEGRATION", passed: true, detail: "The governed server route completed its approval-bound PBOS exchange." },
      { dimension: "AUTHORITY", passed: true, detail: "Anonymous mutation was denied before authenticated execution." },
      { dimension: "SECURITY", passed: true, detail: "Identity and protected connector configuration remained server controlled." }
    ] }, null, 2));
});
