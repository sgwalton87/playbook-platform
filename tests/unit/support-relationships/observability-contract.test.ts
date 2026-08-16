import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(process.cwd(), "supabase/migrations/202608160015_relationship_security_observability.sql"),
  "utf8"
);

describe("relationship security observability", () => {
  it("records activation, revocation, blocking, status, and permission events", () => {
    for (const eventType of [
      "relationship.activated",
      "relationship.revoked",
      "relationship.blocked",
      "relationship.status_changed",
      "relationship.permissions_changed",
    ]) {
      expect(migration).toContain(eventType);
    }
  });

  it("keeps the ledger append-only for authenticated users", () => {
    expect(migration).toContain("grant select on public.relationship_security_events to authenticated");
    expect(migration).toContain("revoke insert, update, delete on public.relationship_security_events from authenticated");
  });

  it("limits event visibility to the Scholar or connected supporter", () => {
    expect(migration).toContain("scholar_id = (select auth.uid())");
    expect(migration).toContain("supporter_id = (select auth.uid())");
  });

  it("keeps the security-definer trigger helper outside the exposed public schema", () => {
    expect(migration).toContain("create schema if not exists private");
    expect(migration).toContain("create or replace function private.capture_relationship_security_event()");
    expect(migration).toContain("revoke all on schema private from authenticated");
  });

  it("captures events from canonical relationship mutations rather than duplicate writes", () => {
    expect(migration).toContain("after insert or update of status, permissions");
    expect(migration).toContain("on public.support_relationships");
    expect(migration).toContain("execute function private.capture_relationship_security_event()");
  });
});
