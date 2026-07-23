import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  throw new Error("Missing Supabase environment required for the OR-008 live audit.");
}

const schemaChecks = [
  { table: "profiles", columns: "id,role,profile_mode,onboarding_completed,community_safety_policy_version" },
  { table: "support_invitations", columns: "id,status,token,invited_role" },
  { table: "support_relationships", columns: "id,scholar_id,supporter_id,status,source_invitation_id" },
  { table: "support_messages", columns: "id,scholar_id,sender_id,sender_role" },
  { table: "notifications", columns: "id,user_id,scholar_id,type,source_event_id" },
  { table: "playbook_events", columns: "id,type,scholar_id,actor_id" },
] as const;

async function main() {
  const admin = createClient(url!, serviceKey!, { auth: { persistSession: false } });
  const anon = createClient(url!, anonKey!, { auth: { persistSession: false } });
  let failures = 0;

  for (const check of schemaChecks) {
    const { error } = await admin.from(check.table).select(check.columns).limit(1);
    const status = error ? "FAIL" : "PASS";
    if (error) failures += 1;
    process.stdout.write(`${status} schema ${check.table}${error ? `: ${error.message}` : ""}\n`);
  }

  for (const table of [
    "support_invitations",
    "support_relationships",
    "support_messages",
    "notifications",
    "playbook_events",
  ] as const) {
    const { data, error } = await anon.from(table).select("*").limit(1);
    const deniedOrEmpty = Boolean(error) || !data?.length;
    if (!deniedOrEmpty) failures += 1;
    process.stdout.write(
      `${deniedOrEmpty ? "PASS" : "FAIL"} anonymous isolation ${table}` +
      `${error ? ` (${error.code})` : ""}\n`,
    );
  }

  if (failures) {
    process.stderr.write(`OR-008 live audit failed ${failures} checks.\n`);
    process.exit(1);
  }

  process.stdout.write("OR-008 live audit passed all read-only checks.\n");
}

void main();
