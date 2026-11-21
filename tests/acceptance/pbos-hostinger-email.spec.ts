import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { assertLocalHostingerRecoveryTarget } from "./helpers/assertLocalHostingerRecoveryTarget.mjs";
import { assertLocalSyntheticAuthTarget } from "./helpers/assertLocalSyntheticAuthTarget.mjs";

type CapturedMessage = { MessageID: string; To?: { Address: string }[] };

test("rehearses governed invitation delivery and correlates the persisted receipt", async ({ page, request, context }) => {
  test.skip(process.env.PBOS_ENABLE_HOSTINGER_RECOVERY !== "YES", "Hostinger recovery is opt-in.");
  assertLocalHostingerRecoveryTarget(process.env);
  const required = ["SUPABASE_SERVICE_ROLE_KEY", "SMTP_USER", "SMTP_PASS", "MAIL_GATEWAY_SECRET"];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) throw new Error(`Missing disposable Hostinger recovery configuration: ${missing.join(", ")}.`);
  const commit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  expect(commit).toBe(process.env.PBOS_ACCEPTANCE_COMMIT);
  expect(await (await request.get("http://127.0.0.1:54324/api/v1/info", { maxRedirects: 0 })).ok()).toBe(true);

  const fixtureId = randomUUID();
  const scholarEmail = `scholar-${fixtureId}@example.invalid`;
  const inviteeEmail = `mentor-${fixtureId}@example.invalid`;
  const password = randomUUID();
  assertLocalSyntheticAuthTarget();
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const payload = { inviteeName: "Synthetic Mentor", inviteeEmail, relationship: "mentor" };
  const anonymous = await request.post("/api/invitations/send", { data: payload, maxRedirects: 0 });
  expect(anonymous.status()).toBe(401);
  const unsigned = await request.post("/api/mail-gateway/hostinger", {
    data: { mailbox: "support", from: inviteeEmail, to: scholarEmail, text: "Synthetic message" },
    maxRedirects: 0,
  });
  expect(unsigned.status()).toBe(401);

  // The authorized harness owns the disposable database and mail sink teardown.
  const created = await admin.auth.admin.createUser({ email: scholarEmail, password, email_confirm: true });
  if (created.error) throw new Error("Could not create the disposable Scholar identity.");
  const scholarId = created.data.user.id;
  const profile = await admin.from("profiles").upsert({
    id: scholarId,
    email: scholarEmail,
    full_name: "Synthetic Scholar",
    role: "scholar",
    profile_mode: "scholar",
    onboarding_completed: true,
  });
  if (profile.error) throw new Error("Could not set up the disposable Scholar profile.");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(scholarEmail);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL(url => !url.pathname.startsWith("/login"));

  const self = await page.request.post("/api/invitations/send", {
    data: { ...payload, inviteeEmail: scholarEmail },
    maxRedirects: 0,
  });
  expect(self.status()).toBe(400);
  const response = await page.request.post("/api/invitations/send", { data: payload, maxRedirects: 0 });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.ok).toBe(true);
  expect(body.deliveryStatus).toBe("sent");
  expect(body.scholarReceiptStatus).toBe("sent");
  expect(body.deliveryReceiptStatus).toBe("recorded");

  const invitation = await admin.from("support_invitations")
    .select("scholar_id,invitee_email,relationship")
    .eq("id", body.invitation.id)
    .single();
  expect(invitation.error).toBeNull();
  expect(invitation.data).toMatchObject({
    scholar_id: scholarId,
    invitee_email: inviteeEmail,
    relationship: "mentor",
  });

  const inbox = await request.get("http://127.0.0.1:54324/api/v1/messages", { maxRedirects: 0 });
  expect(inbox.ok()).toBe(true);
  const { messages } = (await inbox.json()) as { messages: CapturedMessage[] };
  const delivered = messages.filter(message => message.To?.some(address => address.Address === inviteeEmail));
  expect(delivered).toHaveLength(1);
  expect(delivered[0].MessageID).toBeTruthy();
  expect(messages.filter(message => message.To?.some(address => address.Address === scholarEmail))).toHaveLength(1);

  const artifact = "artifacts/pbos-acceptance/048-phase-01-item-hostinger-email";
  await mkdir("artifacts/pbos-acceptance", { recursive: true });
  await context.tracing.start({ screenshots: true, snapshots: false, sources: false });
  await page.goto("/check-email?role=mentor");
  await expect(page.getByRole("heading", { name: "Check your inbox." })).toBeVisible();
  await page.screenshot({ path: `${artifact}-desktop.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Check your inbox." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
  await page.screenshot({ path: `${artifact}-mobile.png`, fullPage: true });
  await context.tracing.stop({ path: `${artifact}-trace.zip` });
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter(item => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);

  // An SMTP capture and a persisted invitation are insufficient without the app's own durable receipt.
  const receipt = await admin.from("support_invitation_smtp_receipts").select("message_id,accepted_at")
    .eq("invitation_id", body.invitation.id).single();
  expect(receipt.error).toBeNull();
  expect(receipt.data?.message_id).toBe(delivered[0].MessageID.replace(/^<|>$/g, ""));
  expect(Number.isFinite(Date.parse(receipt.data?.accepted_at ?? ""))).toBe(true);
  const browserReceipt = await page.request.get(new URL("/rest/v1/support_invitation_smtp_receipts",
    process.env.NEXT_PUBLIC_SUPABASE_URL!).toString(), { maxRedirects: 0 });
  expect([401, 403]).toContain(browserReceipt.status());
  await writeFile(`${artifact}-accessibility.json`, JSON.stringify({ violations: accessibility.violations }));
  await writeFile(`${artifact}.json`, JSON.stringify({
    schemaVersion: 1,
    journeyId: "048-PHASE-01-ITEM-HOSTINGER-EMAIL",
    commit,
    checks: [
      { dimension: "ROUTE", passed: true, detail: "Exercised invitations, inbound webhook, and email handoff." },
      { dimension: "AUTHORITY", passed: true, detail: "Denied anonymous and self-invites. Accepted a distinct synthetic invitee for the Scholar." },
      { dimension: "DURABLE_DATA", passed: true, detail: "Invitation owner and SMTP acceptance receipt persisted together by invitation ID." },
      { dimension: "PBOS_INTEGRATION", passed: true, detail: "Exact-revision browser journey correlated the captured SMTP message with its durable receipt." },
      { dimension: "SECURITY", passed: true, detail: "Unsigned webhook and unauthenticated receipt access denied against disposable localhost services." },
    ],
  }));
});
