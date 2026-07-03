import { describe, expect, it } from "vitest";
import { getRoleDestination, roleOptions } from "@/lib/role-os/roleRoutes";

describe("Role OS routing", () => {
  it("routes family users to Family OS", () => {
    expect(getRoleDestination("family")).toBe("/family-os");
  });

  it("has seven signup role options", () => {
    expect(roleOptions.length).toBe(7);
  });
});
