import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const route = readFileSync(join(root, "app/api/notifications/route.ts"), "utf8");
const hardening = readFileSync(
  join(root, "supabase/migrations/202608160049_notification_definer_surface_hardening.sql"),
  "utf8",
);
const disambiguation = readFileSync(
  join(root, "supabase/migrations/202608160050_notification_legacy_overload_disambiguation.sql"),
  "utf8",
);

describe("Notification definer boundary", () => {
  it("keeps privileged mutation bodies in the private schema behind invoker wrappers", () => {
    expect(hardening).toContain("create or replace function private.transition_notification_outbox");
    expect(hardening).toContain("create or replace function private.finalize_notification_delivery");
    expect(hardening).toContain("security definer");
    expect(hardening).toContain("create or replace function public.transition_notification_outbox");
    expect(hardening).toContain("create or replace function public.finalize_notification_delivery");
    expect(hardening).toContain("security invoker");
  });

  it("uses only narrow delivery RPC parameters from the Next.js route", () => {
    expect(route).toContain('supabase.rpc("transition_notification_outbox"');
    expect(route).toContain('supabase.rpc("finalize_notification_delivery"');
    expect(route).not.toContain("requested_error");
    expect(route).not.toContain("requested_next_attempt_at");
    expect(route).not.toContain("requested_priority");
    expect(route).not.toContain("requested_provenance");
  });

  it("removes defaults from rolling-deploy legacy overloads", () => {
    expect(disambiguation).toContain(
      "drop function if exists public.transition_notification_outbox(uuid,text,text,timestamptz);",
    );
    expect(disambiguation).toContain(
      "drop function if exists public.finalize_notification_delivery(uuid,text,jsonb);",
    );
    expect(disambiguation).not.toContain("default null");
    expect(disambiguation).not.toContain("default '[]'::jsonb");
  });
});
