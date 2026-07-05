import { describe, expect, it } from "vitest";
import fs from "node:fs";

describe("Social Core Sprint II", () => {
  it("has persistent social API routes", () => {
    expect(fs.existsSync("app/api/social/reactions/route.ts")).toBe(true);
    expect(fs.existsSync("app/api/social/comments/route.ts")).toBe(true);
  });

  it("has social migration", () => {
    expect(fs.existsSync("supabase/migrations/20260705_social_comments_reactions.sql")).toBe(true);
  });

  it("feed uses social APIs", () => {
    const feed = fs.readFileSync("app/feed/page.tsx", "utf8");
    expect(feed).toContain("/api/social/reactions");
    expect(feed).toContain("/api/social/comments");
  });
});
