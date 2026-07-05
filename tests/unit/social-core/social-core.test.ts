import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { SCHOLAR_PRIMARY_NAV } from "@/lib/core-journey/navigation";
import { buildSocialNotification, buildSocialRewardEvent } from "@/lib/social-events";

describe("Social Core Recovery", () => {
  it("has community feed route", () => {
    expect(fs.existsSync("app/feed/page.tsx")).toBe(true);
  });

  it("has albums route", () => {
    expect(fs.existsSync("app/albums/page.tsx")).toBe(true);
  });

  it("has mentor connect and events routes", () => {
    expect(fs.existsSync("app/mentor-connect/page.tsx")).toBe(true);
    expect(fs.existsSync("app/community-events/page.tsx")).toBe(true);
  });

  it("puts social routes in scholar navigation", () => {
    expect(SCHOLAR_PRIMARY_NAV.some((item) => item.href === "/feed")).toBe(true);
    expect(SCHOLAR_PRIMARY_NAV.some((item) => item.href === "/albums")).toBe(true);
    expect(SCHOLAR_PRIMARY_NAV.some((item) => item.href === "/mentor-connect")).toBe(true);
  });

  it("builds social reward and notification events", () => {
    expect(buildSocialRewardEvent({ scholarId: "s1", eventType: "achievement.shared" }).coins).toBe(25);
    expect(buildSocialNotification({ userId: "u1", title: "New comment", body: "Someone replied", href: "/feed" }).read).toBe(false);
  });
});
