import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("Live Social Screens", () => {
  it("has live albums page and APIs", () => {
    expect(fs.existsSync("app/albums/page.tsx")).toBe(true);
    expect(fs.existsSync("app/api/albums/route.ts")).toBe(true);
    expect(fs.existsSync("app/api/albums/photos/route.ts")).toBe(true);
  });

  it("has mentor directory page and API", () => {
    expect(fs.existsSync("app/mentor-connect/page.tsx")).toBe(true);
    expect(fs.existsSync("app/api/mentor-directory/route.ts")).toBe(true);
  });

  it("has community events page and APIs", () => {
    expect(fs.existsSync("app/community-events/page.tsx")).toBe(true);
    expect(fs.existsSync("app/api/community-events/route.ts")).toBe(true);
    expect(fs.existsSync("app/api/community-events/rsvp/route.ts")).toBe(true);
  });
});
