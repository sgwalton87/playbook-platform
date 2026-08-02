import { describe, expect, it } from "vitest";
import { authorizeRouteContext } from "@/lib/authorization";

const identity = { id: "supporter-1", email: "support@example.com" };
const profile = { id: "supporter-1", role: "mentor" };

describe("direct route authorization", () => {
  it("rejects unauthenticated direct URL access", () => {
    expect(authorizeRouteContext({ identity: null, profile: null })).toEqual({ authorized: false, reason: "unauthenticated" });
  });

  it("rejects a direct Role OS URL for the wrong canonical role", () => {
    expect(authorizeRouteContext({ identity, profile, allowedRoles: ["educator"] })).toEqual({ authorized: false, reason: "role_forbidden" });
  });

  it("rejects Scholar-owned evidence without an active relationship", () => {
    expect(authorizeRouteContext({ identity, profile, scholarId: "scholar-1", permission: "view_evidence", relationships: [] })).toEqual({ authorized: false, reason: "relationship_required" });
  });

  it("authorizes an active relationship with the required permission", () => {
    const result = authorizeRouteContext({ identity, profile, scholarId: "scholar-1", permission: "view_evidence", relationships: [{ scholarId: "scholar-1", supporterId: identity.id, relationship: "mentor", status: "active", permissions: ["view_evidence"] }] });
    expect(result.authorized).toBe(true);
  });

  it("rejects a role-capable relationship when the Scholar did not grant the permission", () => {
    const result = authorizeRouteContext({ identity, profile, scholarId: "scholar-1", permission: "view_evidence", relationships: [{ scholarId: "scholar-1", supporterId: identity.id, relationship: "mentor", status: "active", permissions: ["view_progress"] }] });
    expect(result).toEqual({ authorized: false, reason: "permission_forbidden" });
  });
});
