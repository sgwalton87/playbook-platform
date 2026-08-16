import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const api = read("app/api/notifications/route.ts");
const migration = read("supabase/migrations/202608160038_notification_authority_convergence.sql");
const center = read("components/notifications-v2/NotificationCenter.tsx");
const reliable = read("lib/pbos/reliable-notifications.ts");

describe("canonical notification authority", () => {
  it("does not accept browser-authored system notification events", () => {
    expect(api).toContain("System notification events are created by governed Playbook workflows.");
    expect(api).toContain("status: 405");
    expect(api).not.toContain("normalizeNotificationEvent(await request.json");
  });
  it("moves user actions through narrow notification RPCs", () => {
    expect(api).toContain('rpc("acknowledge_notification"');
    expect(api).toContain('rpc("set_notification_preference"');
    expect(api).toContain('rpc("transition_notification_outbox"');
    expect(api).toContain('rpc("finalize_notification_delivery"');
  });
  it("revokes direct client mutation and emits only from trusted producers", () => {
    expect(migration).toContain("revoke insert, update, delete on public.pbos_notifications from authenticated, anon");
    expect(migration).toContain("revoke insert, update, delete on public.pbos_notification_outbox from authenticated, anon");
    expect(migration).toContain("verification_review_notification");
    expect(migration).toContain("learning_credential_notification");
    expect(migration).toContain("drop trigger if exists opportunity_recommendation_notification on public.pbos_opportunity_recommendations");
    expect(migration).toContain("drop trigger if exists application_event_notification on public.application_workspace_events");
    expect(migration).not.toContain("create trigger opportunity_recommendation_notification");
    expect(migration).not.toContain("create trigger application_event_notification");
  });
  it("surfaces verification, opportunity, milestone, and intervention categories", () => {
    for (const type of ["verification", "opportunity", "milestone", "intervention"]) expect(reliable).toContain(`"${type}"`);
    expect(center).toContain('"verification"');
    expect(center).toContain('"opportunities"');
    expect(center).toContain('"milestones"');
    expect(center).toContain("Take action →");
  });
});
