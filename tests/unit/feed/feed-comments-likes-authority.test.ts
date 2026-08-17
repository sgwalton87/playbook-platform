import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const feedPage = readFileSync("app/feed/page.tsx", "utf8");
const commentsRoute = readFileSync("app/api/social/comments/route.ts", "utf8");
const reactionsRoute = readFileSync("app/api/social/reactions/route.ts", "utf8");
const migration = readFileSync("supabase/migrations/202608170089_feed_comments_likes_authority.sql", "utf8");

describe("Feed Comments and Likes authority", () => {
  it("keeps the Feed UI on canonical social routes and tables", () => {
    expect(feedPage).toContain('fetch("/api/social/comments"');
    expect(feedPage).toContain('fetch("/api/social/reactions"');
    expect(feedPage).toContain('from("feed_post_comments")');
    expect(feedPage).toContain('from("feed_post_reactions")');
  });

  it("binds comment writes to the authenticated user and 4,000-character contract", () => {
    expect(commentsRoute).toContain("const MAX_COMMENT_LENGTH = 4000");
    expect(commentsRoute).toContain('user_id: user.id');
    expect(commentsRoute).toContain('.eq("user_id", user.id)');
    expect(migration).toContain("feed_post_comments_body_check");
  });

  it("supports only owner-scoped likes and no reaction update privilege", () => {
    expect(reactionsRoute).toContain('const SUPPORTED_REACTIONS = new Set(["like"])');
    expect(reactionsRoute).toContain('user_id: user.id');
    expect(migration).toContain("feed_post_reactions_reaction_check");
    expect(migration).toContain("grant select,insert,delete on public.feed_post_reactions to authenticated");
  });
});
