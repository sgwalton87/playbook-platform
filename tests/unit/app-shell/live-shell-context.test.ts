import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const route = read("app/api/shell/context/route.ts");
const shell = read("components/shell/UnifiedAppShell.tsx");

describe("live authenticated shell context", () => {
  it("uses the signed-in RLS session and returns bounded counts only", () => {
    expect(route).toContain("requireUser()");
    expect(route).toContain('.from("evidence")');
    expect(route).toContain('.from("verifications")');
    expect(route).toContain('.from("pbos_notifications")');
    expect(route).toContain('.from("support_relationships")');
    expect(route).toContain('head: true');
    expect(route).not.toContain("service_role");
    expect(route).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(route).not.toContain("security definer");
  });

  it("treats the hardened notification authority as read-only shell context", () => {
    expect(route).toContain('.from("pbos_notifications").select');
    expect(route).not.toContain('.from("pbos_notifications").insert');
    expect(route).not.toContain('.from("pbos_notifications").update');
    expect(route).not.toContain('.from("pbos_notifications").upsert');
  });

  it("surfaces real context in desktop and mobile shell navigation", () => {
    expect(shell).toContain('fetch("/api/shell/context"');
    expect(shell).toContain("Live context");
    expect(shell).toContain("pendingVerificationCount");
    expect(shell).toContain("unreadAttentionCount");
    expect(shell).toContain("activeSupportCount");
    expect(shell).toContain("evidenceCount");
    expect(shell).toContain("need attention");
    expect(shell).toContain("All caught up");
  });

  it("does not invent an active Scholar selector without a durable authority source", () => {
    expect(shell).not.toContain("selectedScholar");
    expect(shell).not.toContain("activeScholar");
  });
});
