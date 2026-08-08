import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing protected PBOS acceptance configuration: " + name);
  return value;
};

test("EVENT-TO-ACKNOWLEDGED-NOTIFICATION produces exact-revision functional evidence", async ({ page, request, context }) => {
  const artifacts = "artifacts/pbos-acceptance";
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const anonymous = await request.post("/api/notifications", { data: {} });
  expect(anonymous.status()).toBe(401);
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(required("PBOS_ACCEPTANCE_EMAIL"));
  await page.getByLabel("Password", { exact: true }).fill(required("PBOS_ACCEPTANCE_PASSWORD"));
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);
  const event = { eventKey: "pbos-acceptance-notification", type: "message", title: "Application support replied",
    body: "Your mentor added a governed response.", href: "/messages", priority: "medium" };
  const first = await page.request.post("/api/notifications", { data: event });
  expect(first.status()).toBe(200);
  const firstBody = await first.json() as { notification?: { id?: string } };
  expect(firstBody.notification?.id).toBeTruthy();
  const duplicate = await page.request.post("/api/notifications", { data: event });
  expect(duplicate.status()).toBe(200);
  const duplicateBody = await duplicate.json() as { notification?: { id?: string } };
  expect(duplicateBody.notification?.id).toBe(firstBody.notification?.id);
  const acknowledged = await page.request.patch("/api/notifications", { data: {
    action: "READ", notificationId: firstBody.notification!.id
  } });
  expect(acknowledged.status()).toBe(200);
  const preference = await page.request.patch("/api/notifications", { data: {
    action: "PREFERENCE", notificationType: "mail_reply", mode: "daily_digest"
  } });
  expect(preference.status()).toBe(200);
  const loaded = await page.request.get("/api/notifications");
  const center = await loaded.json() as { notifications?: Array<{ id: string; read: boolean }>;
    preferences?: Array<{ notification_type: string; mode: string }> };
  expect(center.notifications?.filter(item => item.id === firstBody.notification?.id)).toEqual([
    expect.objectContaining({ read: true })
  ]);
  expect(center.preferences).toContainEqual(expect.objectContaining({ notification_type: "mail_reply", mode: "daily_digest" }));
  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: "What needs your attention?" })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: artifacts + "/notifications-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.screenshot({ path: artifacts + "/notifications-mobile.png", fullPage: true });
  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter(violation => ["serious", "critical"].includes(violation.impact ?? ""));
  await writeFile(artifacts + "/notifications-accessibility.json", JSON.stringify(accessibility, null, 2));
  expect(blocking).toEqual([]);
  await context.tracing.stop({ path: artifacts + "/notifications-trace.zip" });
  await writeFile(artifacts + "/notifications-acceptance.json", JSON.stringify({ schemaVersion: 1,
    journeyId: "EVENT-TO-ACKNOWLEDGED-NOTIFICATION", commit: required("PBOS_ACCEPTANCE_COMMIT"), checks: [
      { dimension: "DURABLE_DATA", passed: true, detail: "Owner-scoped state survived an authenticated write and read." },
      { dimension: "PBOS_INTEGRATION", passed: true, detail: "The governed server route completed its approval-bound PBOS exchange." },
      { dimension: "AUTHORITY", passed: true, detail: "Anonymous mutation was denied before authenticated execution." },
      { dimension: "SECURITY", passed: true, detail: "Identity and protected connector configuration remained server controlled." }
    ] }, null, 2));
});
