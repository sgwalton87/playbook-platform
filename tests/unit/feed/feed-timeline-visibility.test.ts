import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const feedPage = readFileSync("app/feed/page.tsx", "utf8");
const publicFeed = readFileSync("components/public/PublicNewsFeed.tsx", "utf8");
const pagerMigration = readFileSync("supabase/migrations/202608170093_feed_infinite_scroll.sql", "utf8");
const spec = readFileSync("docs/ENGINEERING/FEED_TIMELINE_VISIBILITY_SPEC.md", "utf8");

describe("Feed Timeline Visibility", () => {
  it("preserves public plus owner-private visibility through the shared RLS-respecting pager", () => {
    expect(feedPage).toContain('rpc("get_feed_page"');
    expect(publicFeed).toContain('rpc("get_feed_page"');
    expect(pagerMigration).toContain("security invoker");
    expect(pagerMigration).toContain("from public.feed_posts fp");
    expect(feedPage).toContain('visibility: post.visibility === "private" ? "private" : "public"');
  });

  it("persists a clear Public / Only me audience choice", () => {
    expect(feedPage).toContain('aria-label="Story visibility"');
    expect(feedPage).toContain('<option value="public">Public</option>');
    expect(feedPage).toContain('<option value="private">Only me</option>');
    expect(feedPage).toContain('visibility,');
    expect(feedPage).toContain('post.visibility === "private" ? " · Only me"');
  });

  it("fails closed for private media rather than misrepresenting public Storage as private", () => {
    expect(feedPage).toContain('disabled={visibility === "private"}');
    expect(feedPage).toContain('Only me stories are text-only');
    expect(feedPage).toContain('Only me stories cannot attach public-bucket media.');
    expect(spec).toContain('current `photos` and `feed-videos` buckets are intentionally public');
    expect(spec).toContain('Only me` posts shall be text-only');
  });
});
