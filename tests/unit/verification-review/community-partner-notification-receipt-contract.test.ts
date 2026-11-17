import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const route = readFileSync("app/api/community-partner-verification/route.ts", "utf8");
const screen = readFileSync("components/community/CommunityPartnerVerificationExperience.tsx", "utf8");
const receipt = readFileSync("supabase/migrations/20261029040000_community_verification_notification_receipt.sql", "utf8");
const reviewer = readFileSync("app/api/admin/verification/community-evidence/route.ts", "utf8");

describe("Community Partner notification receipt security and messaging contract", () => {
  it("limits the receipt to the authenticated request owner and denies anonymous RPC access", () => {
    expect(receipt).toContain("where r.partner_user_id=auth.uid()");
    expect(receipt).toContain("security definer set search_path=''");
    expect(receipt).toContain("revoke all on function public.get_own_community_verification_notification_status() from public,anon");
    expect(receipt).toContain("grant execute on function public.get_own_community_verification_notification_status() to authenticated");
    expect(receipt).not.toContain("service_role");
  });

  it("keeps verification status bound to a signed-in Community Partner, not an arbitrary supplied user", () => {
    expect(route).toContain("const { supabase, user } = await requireUser()");
    expect(route).toContain('requirePlaybookRole(profile.data.profile_mode ?? profile.data.role) !== "other"');
    expect(route).toContain('.eq("partner_user_id", user.id)');
    expect(route).toContain('supabase.rpc("get_own_community_verification_notification_status")');
    expect(route).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("does not imply SMTP acceptance proves inbox delivery or repeat a recorded notification", () => {
    expect(screen).toContain("The mail server accepted the notification, but inbox delivery is not confirmed.");
    expect(screen).toContain("setNotification(result.notification ?? null)");
    expect(screen).toContain("await reload()");
    expect(route).toContain('supabase.rpc("claim_own_community_verification_notice"');
    expect(route).toContain('notificationStatus = receipt.accepted?.length ? "sent" : "failed"');
    expect(route).toContain("do not retry without reviewing mail logs.");
  });

  it("uses the authorized reviewer queue before exposing private evidence links", () => {
    expect(reviewer).toContain('supabase.rpc("get_verification_review_queue")');
    expect(reviewer).toContain('x.request_type==="community-partner"&&x.request_id===requestId');
    expect(reviewer).toContain('createSignedUrl(');
    expect(reviewer).toContain('"Cache-Control":"no-store, private"');
    expect(reviewer).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
