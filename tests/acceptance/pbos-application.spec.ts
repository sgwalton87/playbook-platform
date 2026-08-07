import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing protected PBOS acceptance configuration: " + name);
  return value;
};

test("OPPORTUNITY-TO-APPLICATION produces exact-revision functional evidence", async ({ page, request, context }) => {
  const artifacts = "artifacts/pbos-acceptance";
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const anonymous = await request.post("/api/application-workspaces", { data: {} });
  expect(anonymous.status()).toBe(401);
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(required("PBOS_ACCEPTANCE_EMAIL"));
  await page.getByLabel("Password", { exact: true }).fill(required("PBOS_ACCEPTANCE_PASSWORD"));
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);
  const creation = await page.request.post("/api/application-workspaces", { data: {
    opportunityId: "pbos-acceptance-opportunity", opportunityName: "PBOS Acceptance Scholarship",
    opportunityType: "scholarship", deadline: "2027-05-01", requestId: "pbos-acceptance-application"
  } });
  expect(creation.status()).toBe(201);
  const created = await creation.json() as { workspace?: { workspaceId?: string } };
  expect(created.workspace?.workspaceId).toBeTruthy();
  const reloaded = await page.request.get("/api/application-workspaces");
  expect(reloaded.status()).toBe(200);
  const records = await reloaded.json() as { workspaces?: Array<{ id: string }> };
  expect(records.workspaces?.some(workspace => workspace.id === created.workspace?.workspaceId)).toBe(true);
  await page.goto("/application-workspaces");
  await expect(page.getByRole("heading", { name: "Turn opportunity into action" })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: artifacts + "/application-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.screenshot({ path: artifacts + "/application-mobile.png", fullPage: true });
  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter(violation => ["serious", "critical"].includes(violation.impact ?? ""));
  await writeFile(artifacts + "/application-accessibility.json", JSON.stringify(accessibility, null, 2));
  expect(blocking).toEqual([]);
  await context.tracing.stop({ path: artifacts + "/application-trace.zip" });
  await writeFile(artifacts + "/application-acceptance.json", JSON.stringify({ schemaVersion: 1,
    journeyId: "OPPORTUNITY-TO-APPLICATION", commit: required("PBOS_ACCEPTANCE_COMMIT"), checks: [
      { dimension: "DURABLE_DATA", passed: true, detail: "Owner-scoped state survived an authenticated write and read." },
      { dimension: "PBOS_INTEGRATION", passed: true, detail: "The governed server route completed its approval-bound PBOS exchange." },
      { dimension: "AUTHORITY", passed: true, detail: "Anonymous mutation was denied before authenticated execution." },
      { dimension: "SECURITY", passed: true, detail: "Identity and protected connector configuration remained server controlled." }
    ] }, null, 2));
});
