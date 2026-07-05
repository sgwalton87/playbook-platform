import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { SCHOLAR_PRIMARY_NAV } from "@/lib/core-journey/navigation";

describe("Community Heartbeat Recovery", () => {
  it("keeps feed route available", () => {
    expect(fs.existsSync("app/feed/page.tsx")).toBe(true);
  });

  it("keeps profile wall route available", () => {
    expect(fs.existsSync("app/u/[username]/page.tsx")).toBe(true);
  });

  it("restores Community to scholar navigation", () => {
    expect(SCHOLAR_PRIMARY_NAV.some((item) => item.href === "/feed")).toBe(true);
  });
});
