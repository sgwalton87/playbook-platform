import { createClient } from "@supabase/supabase-js";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing Family acceptance configuration: " + name);
  return value;
};

const syntheticCredentials = (label: string) => ({
  email: `pbos-${label}-${randomUUID()}@acceptance.playbook.local`,
  password: `Pb0s!${randomBytes(18).toString("base64url")}`,
});

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

  const scholarCredentials = syntheticCredentials("family-scholar");
  const familyCredentials = syntheticCredentials("family-guardian");
  const attackerCredentials = syntheticCredentials("family-attacker");

  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const createdUserIds: string[] = [];

  async function createSyntheticUser(email: string, password: string, role: string) {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role, profile_mode: role, synthetic: true },
    });
    if (created.error || !created.data.user) throw created.error ?? new Error("Synthetic Family user creation failed.");
    createdUserIds.push(created.data.user.id);
    const profile = await admin.from("profiles").upsert({
      id: created.data.user.id,
      email,
      role,
      profile_mode: role,
      onboarding_completed: true,
    }, { onConflict: "id" });
    if (profile.error) throw profile.error;
    return created.data.user;
  }

  try {
    const scholar = await createSyntheticUser(scholarCredentials.email, scholarCredentials.password, "scholar");
    const family = await createSyntheticUser(familyCredentials.email, familyCredentials.password, "family");
    await createSyntheticUser(attackerCredentials.email, attackerCredentials.password, "family");

    await login(page, scholarCredentials.email, scholarCredentials.password);
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
    }, { inviteeEmail: familyCredentials.email });

    expect([200, 202]).toContain(sent.status);
    expect(sent.body.invitation?.token).toBeTruthy();
    expect(sent.body.invitation?.permissions).toEqual(["view_progress", "view_deadlines", "support_tasks"]);
    const token = String(sent.body.invitation.token);

    await resetBrowserAuth(context, page);
    await login(page, attackerCredentials.email, attackerCredentials.password);
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
    await login(page, familyCredentials.email, familyCredentials.password);
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
      supporter_email: familyCredentials.email,
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
        { dimension: "NEGATIVE_AUTHORIZATION", passed: true, detail: "A different authenticated identity received 403; invitation stayed pending and no relationship was created." },
        { dimension: "ATOMIC_CONSENT", passed: true, detail: "Matching invitee acceptance atomically consumed the invitation and created one support relationship." },
        { dimension: "LEAST_PRIVILEGE", passed: true, detail: "Parent/Guardian received only view_progress, view_deadlines, and support_tasks." },
        { dimension: "ROUTING", passed: true, detail: "Accepted Family relationship routes to /family-os without duplicating destination into relationship persistence." },
        { dimension: "TEST_ISOLATION", passed: true, detail: "The trusted run generated disposable synthetic identities instead of relying on shared account secrets." }
      ],
    }, null, 2));
  } finally {
    for (const userId of createdUserIds.reverse()) {
      await admin.auth.admin.deleteUser(userId).catch(() => undefined);
    }
  }
});
