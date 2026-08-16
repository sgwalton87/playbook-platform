import { createClient } from "@supabase/supabase-js";
import { test, expect, type BrowserContext, type Page } from "@playwright/test";

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error("Missing Mentor validation acceptance configuration: " + name);
  return value;
};

async function resetAuth(context: BrowserContext, page: Page) {
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

async function postJson(page: Page, url: string, body: unknown) {
  return await page.evaluate(async ({ target, payload }) => {
    const response = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { status: response.status, body: await response.json() };
  }, { target: url, payload: body });
}

test("Scholar-invited mentor requires governed support-system validation", async ({ page, context }) => {
  const admin = createClient(required("NEXT_PUBLIC_SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const credentials = {
    scholar: [required("MENTOR_ACCEPTANCE_SCHOLAR_EMAIL").toLowerCase(), required("MENTOR_ACCEPTANCE_SCHOLAR_PASSWORD")],
    mentor: [required("MENTOR_ACCEPTANCE_MENTOR_EMAIL").toLowerCase(), required("MENTOR_ACCEPTANCE_MENTOR_PASSWORD")],
    validatorOne: [required("MENTOR_ACCEPTANCE_VALIDATOR_ONE_EMAIL").toLowerCase(), required("MENTOR_ACCEPTANCE_VALIDATOR_ONE_PASSWORD")],
    validatorTwo: [required("MENTOR_ACCEPTANCE_VALIDATOR_TWO_EMAIL").toLowerCase(), required("MENTOR_ACCEPTANCE_VALIDATOR_TWO_PASSWORD")],
  } as const;

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
      if (created.error || !created.data.user) throw created.error ?? new Error("Synthetic mentor validation user creation failed.");
      user = created.data.user;
    } else {
      const updated = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
      if (updated.error) throw updated.error;
    }
    await admin.from("profiles").upsert({ id: user.id, email, role, profile_mode: role }, { onConflict: "id" });
    return user;
  }

  const scholar = await ensureUser(credentials.scholar[0], credentials.scholar[1], "scholar");
  const mentor = await ensureUser(credentials.mentor[0], credentials.mentor[1], "mentor");
  const validatorOne = await ensureUser(credentials.validatorOne[0], credentials.validatorOne[1], "educator");
  const validatorTwo = await ensureUser(credentials.validatorTwo[0], credentials.validatorTwo[1], "family");

  await admin.from("mentor_validation_approvals").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await admin.from("mentor_validation_requests").delete().eq("scholar_id", scholar.id).eq("mentor_user_id", mentor.id);
  await admin.from("support_relationships").delete().eq("scholar_id", scholar.id).eq("supporter_id", mentor.id);
  await admin.from("support_invitations").delete().eq("scholar_id", scholar.id).eq("invitee_email", credentials.mentor[0]);

  // These are fixture relationships representing already-governed support members.
  await admin.from("support_relationships").upsert([
    {
      scholar_id: scholar.id,
      supporter_id: validatorOne.id,
      supporter_email: credentials.validatorOne[0],
      supporter_name: "Validator One",
      relationship: "educator",
      permissions: ["view_progress", "recommend_actions"],
      status: "active",
    },
    {
      scholar_id: scholar.id,
      supporter_id: validatorTwo.id,
      supporter_email: credentials.validatorTwo[0],
      supporter_name: "Validator Two",
      relationship: "community_support",
      permissions: ["support_tasks"],
      status: "active",
    },
  ]);

  await login(page, credentials.scholar[0], credentials.scholar[1]);
  const invitation = await postJson(page, "/api/invitations/send", {
    scholarName: "Mentor Validation Scholar",
    inviteeName: "Mentor Candidate",
    inviteeEmail: credentials.mentor[0],
    relationship: "mentor",
  });
  expect([200, 202]).toContain(invitation.status);
  const token = String(invitation.body.invitation?.token ?? "");
  expect(token).toBeTruthy();

  await resetAuth(context, page);
  await login(page, credentials.mentor[0], credentials.mentor[1]);
  const accepted = await postJson(page, "/api/invitations/accept", { token, status: "accepted" });
  expect(accepted.status, JSON.stringify(accepted.body)).toBe(200);
  expect(accepted.body.activationState).toBe("pending_validation");
  expect(accepted.body.destination).toBe("/pending");
  const validationRequestId = String(accepted.body.validationRequestId ?? "");
  expect(validationRequestId).toBeTruthy();

  const prematureRelationship = await admin.from("support_relationships")
    .select("id")
    .eq("scholar_id", scholar.id)
    .eq("supporter_id", mentor.id)
    .eq("relationship", "mentor")
    .maybeSingle();
  if (prematureRelationship.error) throw prematureRelationship.error;
  expect(prematureRelationship.data).toBeNull();

  const prematureFinalize = await postJson(page, "/api/mentor-validation/finalize", { validationRequestId });
  expect(prematureFinalize.status).toBe(403);

  await resetAuth(context, page);
  await login(page, credentials.validatorOne[0], credentials.validatorOne[1]);
  const firstApproval = await postJson(page, "/api/mentor-validation/approve", { validationRequestId });
  expect(firstApproval.status, JSON.stringify(firstApproval.body)).toBe(200);
  expect(firstApproval.body.validation.approvalCount).toBe(1);
  expect(firstApproval.body.validation.thresholdMet).toBe(false);

  await resetAuth(context, page);
  await login(page, credentials.mentor[0], credentials.mentor[1]);
  const oneApprovalFinalize = await postJson(page, "/api/mentor-validation/finalize", { validationRequestId });
  expect(oneApprovalFinalize.status).toBe(403);

  await resetAuth(context, page);
  await login(page, credentials.validatorTwo[0], credentials.validatorTwo[1]);
  const secondApproval = await postJson(page, "/api/mentor-validation/approve", { validationRequestId });
  expect(secondApproval.status, JSON.stringify(secondApproval.body)).toBe(200);
  expect(secondApproval.body.validation.approvalCount).toBe(2);
  expect(secondApproval.body.validation.thresholdMet).toBe(true);

  await resetAuth(context, page);
  await login(page, credentials.mentor[0], credentials.mentor[1]);
  const finalized = await postJson(page, "/api/mentor-validation/finalize", { validationRequestId });
  expect(finalized.status, JSON.stringify(finalized.body)).toBe(200);
  expect(finalized.body.destination).toBe("/mentor-os");

  const relationship = await admin.from("support_relationships")
    .select("scholar_id,supporter_id,relationship,permissions,status,source_invitation_id")
    .eq("scholar_id", scholar.id)
    .eq("supporter_id", mentor.id)
    .eq("relationship", "mentor")
    .single();
  if (relationship.error) throw relationship.error;
  expect(relationship.data.status).toBe("active");
  expect(relationship.data.permissions).toEqual(["view_progress", "recommend_actions", "support_tasks"]);
});

test("one active Parent/Guardian or Coach approval satisfies the Mentor threshold", async ({ page }) => {
  // This threshold behavior is database-authoritative. The exact-head environment
  // supplies a request ID and a validator account whose already-governed active
  // relationship is either parent_guardian or coach.
  await login(page, required("MENTOR_ACCEPTANCE_PRIVILEGED_VALIDATOR_EMAIL"), required("MENTOR_ACCEPTANCE_PRIVILEGED_VALIDATOR_PASSWORD"));
  const validationRequestId = required("MENTOR_ACCEPTANCE_PRIVILEGED_REQUEST_ID");
  const approval = await postJson(page, "/api/mentor-validation/approve", { validationRequestId });
  expect(approval.status, JSON.stringify(approval.body)).toBe(200);
  expect(approval.body.validation.privilegedValidator).toBe(true);
  expect(approval.body.validation.thresholdMet).toBe(true);
});
