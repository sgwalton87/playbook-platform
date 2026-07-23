import { describe, expect, it } from "vitest";
import fs from "node:fs";

const routes = [
  "app/page.tsx",
  "app/home/page.tsx",
  "app/dashboard/page.tsx",
  "app/messages/page.tsx",
  "app/notifications/page.tsx",
  "app/record/page.tsx",
  "app/courses/page.tsx",
  "app/opportunities/page.tsx",
  "app/opportunity-toolkit/page.tsx",
  "app/application-workspaces/page.tsx",
  "app/recommenders/page.tsx",
  "app/portfolio/[shareId]/page.tsx",
  "app/scholar-athlete-os/page.tsx",
  "app/tay-os/page.tsx",
  "app/athlete-abroad-os/page.tsx",
  "app/gamification/page.tsx",
  "app/reward-economy/page.tsx",
  "app/economy/page.tsx",
  "app/store-v2/page.tsx",
  "app/tutorial/page.tsx",
  "app/studio/page.tsx",
];

describe("Full Site Route Audit", () => {
  for (const route of routes) {
    it(`has ${route}`, () => {
      expect(fs.existsSync(route)).toBe(true);
    });
  }
});
