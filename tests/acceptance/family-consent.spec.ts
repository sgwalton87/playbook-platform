import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing Family acceptance configuration: " + name);
  return value;
};

async function resetBrowserAuth(context: BrowserContext, page: Page) {
  await context.clearCookies();
  await page.goto("/login");
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.reload();
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await page.waitForLoadState("networkidle");
}

test("Family access requires scholar invitation plus matching invitee consent", async ({ page, context }) => {
  const artifacts = "artifacts/pbos-acceptance";
  await mkdir(artifacts, { recursive: true });

  const scholarEmail = required("FAMILY_ACCEPTANCE_SCHOLAR_EMAIL").toLowerCase();
  const scholarPassword = required("FAMILY_ACCEPTANCE_SCHOLAR_PASSWORD");
  const familyEmail = required("FAMILY_ACCEPTANCE_FAMILY_EMAIL").toLowerCase();
  const familyPassword = required("FAMILY_ACCEPTANCE_FAMILY_PASSWORD");
  const attackerEmail = required("FAMILY_ACCEPTANCE_ATTACKER_EMAIL").toLowerCase();
  const attackerPassword = required("FAMILY_ACCEPTANCE_ATTACKER_PASSWORD");

  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  async function ensureUser(email: string, password: string, role: string) {
    const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listed.error) throw listed.error;
    let user = listed.data.users.find(candidate => candidate.email?.toLowerCase() === email);
    if (!user) {
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role, profile_mode: role, synthetic: true },
      });
      if (created.error || !created.data.user) throw created.error ?? new Error("Synthetic user creation failed.");
      user = created.data.user;
    } else {
      const updated = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
      if (updated.error) throw updated.error;
    }
    await admin.from("profiles").upsert({ id: user.id, email, role, profile_mode: role }, { onConflict: "id" });
    return user;
  }

  const scholar = await ensureUser(scholarEmail, scholarPassword, "scholar");
  const family = await ensureUser(familyEmail, familyPassword, "family");
  await ensureUser(attackerEmail, attackerPassword, "family");

  await admin.from("support_relationships").delete().eq("scholar_id", scholar.id).eq("supporter_email", familyEmail);
  await admin.from("support_invitations").delete().eq("scholar_id", scholar.id).eq("invitee_email", familyEmail);

  await login(page, scholarEmail, scholarPassword);
  const sent = await page.evaluate(async ({ inviteeEmail }) => {
    const response = await fetch("/api/invitations/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scholarName: "Family Acceptance Scholar",
        inviteeName: "Family Acceptance Guardian",
        inviteeEmail,
        relationship: "parent_guardian",
      }),
    });
    return { status: response.status, body: await response.json() };
  }, { inviteeEmail: familyEmail });

  expect([200, 202]).toContain(sent.status);
  expect(sent.body.invitation?.token).toBeTruthy();
  expect(sent.body.invitation?.permissions).toEqual(["view_progress", "view_deadlines", "support_tasks"]);
  const token = String(sent.body.invitation.token);

  await resetBrowserAuth(context, page);
  await login(page, attackerEmail, attackerPassword);
  const wrongAccount = await page.evaluate(async ({ invitationToken }) => {
    const response = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: invitationToken, status: "accepted" }),
    });
    return { status: response.status, body: await response.json() };
  }, { invitationToken: token });
  expect(wrongAccount.status).toBe(403);

  const stillPending = await admin.from("support_invitations").select("status").eq("token", token).single();
  if (stillPending.error) throw stillPending.error;
  expect(stillPending.data.status).toBe("pending");
  const unauthorizedRelationship = await admin.from("support_relationships")
    .select("id")
    .eq("source_invitation_id", sent.body.invitation.id)
    .maybeSingle();
  if (unauthorizedRelationship.error) throw unauthorizedRelationship.error;
  expect(unauthorizedRelationship.data).toBeNull();

  await resetBrowserAuth(context, page);
  await login(page, familyEmail, familyPassword);
  const accepted = await page.evaluate(async ({ invitationToken }) => {
    const response = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: invitationToken, status: "accepted" }),
    });
    return { status: response.status, body: await response.json() };
  }, { invitationToken: token });

  expect(accepted.status, JSON.stringify(accepted.body)).toBe(200);
  expect(accepted.body.destination).toBe("/family-os");

  const invitation = await admin.from("support_invitations").select("status,accepted_at").eq("token", token).single();
  if (invitation.error) throw invitation.error;
  expect(invitation.data.status).toBe("accepted");
  expect(invitation.data.accepted_at).toBeTruthy();

  const relationship = await admin.from("support_relationships")
    .select("scholar_id,supporter_id,supporter_email,relationship,permissions,status,source_invitation_id")
    .eq("source_invitation_id", sent.body.invitation.id)
    .single();
  if (relationship.error) throw relationship.error;
  expect(relationship.data).toMatchObject({
    scholar_id: scholar.id,
    supporter_id: family.id,
    supporter_email: familyEmail,
    relationship: "parent_guardian",
    status: "active",
    source_invitation_id: sent.body.invitation.id,
  });
  expect(relationship.data.permissions).toEqual(["view_progress", "view_deadlines", "support_tasks"]);

  await writeFile(artifacts + "/family-consent-acceptance.json", JSON.stringify({
    schemaVersion: 1,
    journeyId: "FAMILY-SCHOLAR-CONSENT-RELATIONSHIP",
    commit: required("PBOS_ACCEPTANCE_COMMIT"),
    checks: [
      { dimension: "SCHOLAR_GRANT", passed: true, detail: "Authenticated scholar created the durable parent_guardian invitation under owner-scoped RLS." },
      { dimension: "NEGATIVE_AUTHORIZATION", passed: true, detail: "A different authenticated email received 403; invitation stayed pending and no relationship was created." },
      { dimension: "ATOMIC_CONSENT", passed: true, detail: "Matching invitee acceptance atomically consumed the invitation and created one support relationship." },
      { dimension: "LEAST_PRIVILEGE", passed: true, detail: "Parent/Guardian received only view_progress, view_deadlines, and support_tasks." },
      { dimension: "ROUTING", passed: true, detail: "Accepted Family relationship routes to /family-os without duplicating destination into relationship persistence." }
    ],
  }, null, 2));
});
