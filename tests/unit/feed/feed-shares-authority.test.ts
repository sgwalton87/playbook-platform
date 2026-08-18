import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const feedPage = readFileSync("app/feed/page.tsx", "utf8");
const storyPage = readFileSync("app/story/[id]/page.tsx", "utf8");
const route = readFileSync("app/api/social/shares/route.ts", "utf8");
const migration = readFileSync("supabase/migrations/202608170091_feed_shares_authority.sql", "utf8");
const spec = readFileSync("docs/ENGINEERING/FEED_SHARES_SPEC.md", "utf8");

describe("Feed Shares authority", () => {
  it("persists append-only authenticated share completion over canonical public posts", () => {
    expect(migration).toContain("create table if not exists public.feed_post_shares");
    expect(migration).toContain("references public.feed_posts(id)");
    expect(migration).toContain("references public.profiles(id)");
    expect(migration).toContain("feed_post_shares_insert_owner_public_post");
    expect(migration).toContain("grant select,insert");
    expect(route).toContain('eq("visibility", "public")');
    expect(route).toContain('user_id: user.id');
    expect(route).toContain('path: `/story/${postId}`');
  });

  it("exposes Share only for public authenticated Feed cards and records after completion", () => {
    expect(feedPage).toContain('post.visibility === "public" && <button');
    expect(feedPage).toContain('navigator.share');
    expect(feedPage).toContain('navigator.clipboard.writeText(url)');
    expect(feedPage).toContain('if (cause instanceof DOMException && cause.name === "AbortError") return');
    expect(feedPage).toContain('fetch("/api/social/shares"');
    expect(feedPage.indexOf('await navigator.share')).toBeLessThan(feedPage.indexOf('fetch("/api/social/shares"'));
    expect(spec).toContain("A cancelled or failed share shall not be recorded as completed.");
  });

  it("provides a stable public permalink that fails closed for private stories", () => {
    expect(storyPage).toContain('.eq("id", postId)');
    expect(storyPage).toContain('.eq("visibility", "public")');
    expect(storyPage).toContain('rpc("get_public_member_identities"');
    expect(storyPage).toContain('story.mediaType === "video"');
    expect(storyPage).toContain('This story is not public');
  });
});
