import { createClient } from "@supabase/supabase-js";
import { randomBytes, randomUUID } from "node:crypto";

// Disposable accounts for all 15 Playbook roles. Never invoke against production.
const roles = [
  "scholar", "scholar-athlete", "transition-youth", "family", "mentor",
  "educator", "high-school-counselor", "coach", "college-coach",
  "college-admissions", "brand-partner", "employer", "district",
  "athlete-abroad", "other",
];
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
const base = process.env.PLAYWRIGHT_BASE_URL;
if (process.env.PBOS_ALLOW_SYNTHETIC_AUTH_WRITE !== "YES" || !url || !secret || !base) {
  throw new Error("Explicit isolated QA configuration is required");
}
const endpoint = new URL(url);
const app = new URL(base);
if (!["127.0.0.1", "localhost"].includes(endpoint.hostname) ||
    !["127.0.0.1", "localhost"].includes(app.hostname)) {
  throw new Error("REFUSED: test accounts may only be created against localhost");
}
const admin = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
const ids = [];
try {
  for (const role of roles) {
    const email = `pbos-qa-${role}-${randomUUID()}@example.invalid`;
    const password = `${randomBytes(24).toString("base64url")}Aa1!`;
    const result = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { role, profile_mode: role, synthetic: true },
    });
    if (result.error || !result.data.user) {
      throw result.error ?? new Error(`Account not created for ${role}`);
    }
    const id = result.data.user.id;
    ids.push(id);
    const saved = await admin.from("profiles").upsert({
      id, role, profile_mode: role, requested_role: role,
      verification_status: "email_confirmed",
      onboarding_completed: false,
      onboarding_data: {
        first_name: "Test", last_name: "Account",
        role_test_marker: `fixture-${role}`, onboarding_step_index: 0,
      },
    }, { onConflict: "id" });
    if (saved.error) throw saved.error;
    const check = await admin.from("profiles").select("role,profile_mode,onboarding_data").eq("id", id).single();
    if (check.error || check.data?.role !== role ||
        check.data?.profile_mode !== role ||
        check.data?.onboarding_data?.role_test_marker !== `fixture-${role}`) {
      throw new Error(`Private fixture verification failed for ${role}`);
    }
    // Do not output credentials or personally identifying data.
    process.stdout.write(`PROVISIONED_AND_VERIFIED: ${role}\n`);
  }
  if (ids.length !== 15) throw new Error("Expected exactly 15 role accounts");
  process.stdout.write("ROLE_ACCOUNT_MATRIX: 15/15 created and verified against disposable local Supabase\n");
} finally {
  for (const id of ids) {
    const deleted = await admin.auth.admin.deleteUser(id);
    if (deleted.error) throw new Error("Synthetic account cleanup failed");
  }
  process.stdout.write(`CLEANUP: ${ids.length}/${ids.length} isolated accounts removed\n`);
}
