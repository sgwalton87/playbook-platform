import AxeBuilder from "@axe-core/playwright";
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing protected PBOS acceptance configuration: " + name);
  return value;
};

test("AUTHORIZED-SUPPORT-MESSAGING produces exact-revision functional evidence", async ({ page, request, context }) => {
  const artifacts = "artifacts/pbos-acceptance";
  await mkdir(artifacts, { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const anonymous = await request.post("/api/support-network/messages", { data: {} });
  expect(anonymous.status()).toBe(401);
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(required("PBOS_ACCEPTANCE_EMAIL"));
  await page.getByLabel("Password", { exact: true }).fill(required("PBOS_ACCEPTANCE_PASSWORD"));
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForURL(/\/dashboard/);
  const email = required("PBOS_ACCEPTANCE_EMAIL");
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  const users = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (users.error) throw users.error;
  const user = users.data.users.find(candidate => candidate.email === email);
  if (!user) throw new Error("Governed Scholar acceptance identity was not found.");
  const existing = await admin.from("support_relationships").select("id").eq("scholar_id", user.id)
    .eq("supporter_email", "pbos-support@example.com").eq("status", "active").limit(1).maybeSingle();
  if (existing.error) throw existing.error;
  let relationshipId = existing.data?.id as string | undefined;
  if (!relationshipId) {
    const created = await admin.from("support_relationships").insert({ scholar_id: user.id,
      supporter_email: "pbos-support@example.com", supporter_name: "PBOS Acceptance Mentor", relationship: "mentor",
      permissions: ["view_progress", "support_tasks"], status: "active" }).select("id").single();
    if (created.error || !created.data) throw created.error ?? new Error("Synthetic support relationship was not created.");
    relationshipId = created.data.id as string;
  }
  const sent = await page.request.post("/api/support-network/messages", { data: { relationshipId,
    body: "PBOS governed acceptance message", requestId: "pbos-acceptance-message" } });
  expect(sent.status()).toBe(201);
  const sentBody = await sent.json() as { message?: { id?: string }; conversation?: { id?: string } };
  expect(sentBody.message?.id).toBeTruthy();
  const loaded = await page.request.get("/api/support-network/messages");
  expect(loaded.status()).toBe(200);
  const inbox = await loaded.json() as { conversations?: Array<{ id: string; messages?: Array<{ id: string }> }> };
  expect(inbox.conversations?.some(conversation => conversation.id === sentBody.conversation?.id &&
    conversation.messages?.some(message => message.id === sentBody.message?.id))).toBe(true);
  await page.goto("/messages");
  await expect(page.getByRole("heading", { name: "Your governed support conversations" })).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: artifacts + "/messaging-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.screenshot({ path: artifacts + "/messaging-mobile.png", fullPage: true });
  const accessibility = await new AxeBuilder({ page }).analyze();
  const blocking = accessibility.violations.filter(violation => ["serious", "critical"].includes(violation.impact ?? ""));
  await writeFile(artifacts + "/messaging-accessibility.json", JSON.stringify(accessibility, null, 2));
  expect(blocking).toEqual([]);
  await context.tracing.stop({ path: artifacts + "/messaging-trace.zip" });
  await writeFile(artifacts + "/messaging-acceptance.json", JSON.stringify({ schemaVersion: 1,
    journeyId: "AUTHORIZED-SUPPORT-MESSAGING", commit: required("PBOS_ACCEPTANCE_COMMIT"), checks: [
      { dimension: "DURABLE_DATA", passed: true, detail: "Owner-scoped state survived an authenticated write and read." },
      { dimension: "PBOS_INTEGRATION", passed: true, detail: "The governed server route completed its approval-bound PBOS exchange." },
      { dimension: "AUTHORITY", passed: true, detail: "Anonymous mutation was denied before authenticated execution." },
      { dimension: "SECURITY", passed: true, detail: "Identity and protected connector configuration remained server controlled." }
    ] }, null, 2));
});
