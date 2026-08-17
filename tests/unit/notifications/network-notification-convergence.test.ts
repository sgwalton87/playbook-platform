import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Network notification convergence", () => {
  it("processes only the authenticated owner's bounded trusted pending outbox", () => {
    const source = read("app/api/notifications/route.ts");
    const postSource = source.split("export async function POST()")[1]?.split("export async function PATCH")[0] ?? "";
    expect(postSource).toContain('.eq("owner_id", user.id)');
    expect(postSource).toContain('.eq("state", "PENDING")');
    expect(postSource).toContain('.limit(25)');
    expect(postSource).toContain('await deliver(supabase, user.id, outbox)');
    expect(postSource).not.toContain('request.json()');
  });

  it("drains trusted pending events before reading the attention center", () => {
    const source = read("components/notifications-v2/NotificationCenter.tsx");
    expect(source).toContain('fetch("/api/notifications", { method: "POST"');
    expect(source).toContain("return fetchNotifications()");
    expect(source).toContain("syncNotifications()");
  });

  it("keeps Network lifecycle events inside the shared governed notification outbox", () => {
    const source = read("supabase/migrations/202608170083_network_notification_producers.sql");
    expect(source).toContain("private.enqueue_notification_event");
    expect(source).toContain("network:connection-request:");
    expect(source).toContain("'invitation'");
    expect(source).toContain("'shared_action'");
    expect(source).toContain("'/connections'");
    expect(source).not.toContain("insert into public.pbos_notifications");
  });
});
