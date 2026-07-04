import { describe, expect, it } from "vitest";
import fs from "node:fs";

const routes = [
  "app/messages/page.tsx",
  "app/invite/[token]/page.tsx",
  "app/scholar-network/page.tsx",
  "app/network-intelligence/page.tsx",
  "app/role-select/page.tsx",
  "app/family-os/page.tsx",
  "app/mentor-os/page.tsx",
  "app/studio/page.tsx",
  "app/notifications/page.tsx",
];

describe("Beta 3.1 route hardening", () => {
  for (const route of routes) {
    it(`has ${route}`, () => {
      expect(fs.existsSync(route)).toBe(true);
    });
  }
});
