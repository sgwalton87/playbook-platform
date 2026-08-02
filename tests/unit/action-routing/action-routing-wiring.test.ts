import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const component = readFileSync("components/action-routing/ActionRoutingCenter.tsx", "utf8");
const route = readFileSync("app/api/action-routing/route.ts", "utf8");
describe("action routing wiring", () => {
  it("loads and updates persisted handoffs", () => { expect(component).toContain('fetch("/api/action-routing"'); expect(component).toContain('method: "PATCH"'); });
  it("does not use static role notification fixtures", () => expect(component).not.toContain("getRoleNotifications"));
  it("uses governed RPC transitions", () => { expect(route).toContain('rpc("create_role_action_handoff"'); expect(route).toContain('rpc("update_role_action_handoff"'); });
});
