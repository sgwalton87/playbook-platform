import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608180101_messaging_report_user_authority.sql", "utf8");
const preflight = readFileSync("supabase/tests/messaging_report_user_preflight.sql", "utf8");
const reportRoute = readFileSync("app/api/trust/report/route.ts", "utf8");
const moderationRoute = readFileSync("app/api/admin/moderation/route.ts", "utf8");
const moderationPage = readFileSync("app/admin/moderation/page.tsx", "utf8");
const inbox = readFileSync("components/messages/InboxV2.tsx", "utf8");
const workflow = readFileSync(".github/workflows/database-certification.yml", "utf8");
const spec = readFileSync("docs/ENGINEERING/MESSAGING_REPORT_USER_SPEC.md", "utf8");

describe("Messaging Report User authority", () => {
  it("reuses canonical Trust & Safety and Messaging records", () => {
    expect(spec).toContain("`moderation_reports` remains the canonical report case");
    expect(spec).toContain("`pbos_messages` remains canonical message content and evidence");
    expect(migration).toContain("alter table public.moderation_reports");
    expect(migration).toContain("source_conversation_id");
    expect(migration).toContain("source_message_id");
    expect(migration).not.toContain("create table public.messaging_user_reports");
    expect(migration).not.toContain("new.body");
  });

  it("requires governed conversation and target identity authority", () => {
    expect(migration).toContain("private.pbos_user_has_active_conversation_access");
    expect(migration).toContain("private.pbos_conversation_peer_id");
    expect(migration).toContain("A source message is required for a group user report");
    expect(migration).toContain("m.sender_id=requested_user_id");
    expect(migration).toContain("You cannot report your own profile");
    expect(preflight).toContain("Unrelated profile was reportable through support context");
    expect(preflight).toContain("Group profile report did not require a source message");
  });

  it("removes direct profile-report creation and keeps evidence lineage immutable", () => {
    expect(migration).toContain("and target_type<>'profile'");
    expect(migration).toContain("grant update(status,resolution_note,reviewed_by,reviewed_at)");
    expect(migration).toContain("revoke all on table public.moderation_reports from public,anon,authenticated");
    expect(preflight).toContain("Direct profile report insertion bypassed governed Messaging authority");
    expect(preflight).toContain("Canonical report identity and evidence lineage must be immutable to clients");
  });

  it("routes profile reports through the shared governed API", () => {
    expect(reportRoute).toContain('targetType === "profile"');
    expect(reportRoute).toContain('rpc("report_governed_messaging_user"');
    expect(reportRoute).toContain("requested_conversation_id");
    expect(reportRoute).toContain("requested_message_id");
    expect(reportRoute).toContain("PROFILE_REPORT_REASONS");
  });

  it("presents an accessible Report User workflow distinct from message reporting and blocking", () => {
    expect(inbox).toContain("Report user");
    expect(inbox).toContain("Report message");
    expect(inbox).toContain("Submit report");
    expect(inbox).toContain("report-user-reason");
    expect(inbox).toContain("report-user-detail");
    expect(inbox).toContain('targetType: "profile"');
    expect(inbox).toContain("sourceMessageId: reportTarget.sourceMessageId");
    expect(inbox).toContain('message.sender_id !== currentUserId');
    expect(inbox).toContain("Reporting did not automatically block this user");
    expect(inbox).not.toContain("window.prompt");
  });

  it("keeps private evidence behind the human moderation boundary", () => {
    expect(migration).toContain("get_moderation_profile_report_context");
    expect(migration).toContain("private.current_user_is_platform_moderator");
    expect(moderationRoute).toContain('rpc("get_moderation_profile_report_context"');
    expect(moderationRoute).toContain("target_profile");
    expect(moderationRoute).toContain("source_context");
    expect(moderationPage).toContain("Reported user:");
    expect(moderationPage).toContain("Source message sent");
    expect(moderationPage).toContain("Resolve only");
    expect(preflight).toContain("Non-moderator accessed private Report User evidence");
  });

  it("registers full database certification for the release", () => {
    expect(workflow).toContain("Certify Messaging Report User authority");
    expect(workflow).toContain("supabase/tests/messaging_report_user_preflight.sql");
  });
});
