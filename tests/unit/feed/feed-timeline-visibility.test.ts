import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const feedPage = readFileSync("app/feed/page.tsx", "utf8");
const publicFeed = readFileSync("components/public/PublicNewsFeed.tsx", "utf8");
const spec = readFileSync("docs/ENGINEERING/FEED_TIMELINE_VISIBILITY_SPEC.md", "utf8");

describe("Feed Timeline Visibility", () => {
  it("loads public stories plus the signed-in owner's private timeline", () => {
    expect(feedPage).toContain('.or(`visibility.eq.public,user_id.eq.${user.id}`)');
    expect(feedPage).toContain('visibility: post.visibility === "private" ? "private" : "public"');
    expect(publicFeed).toContain('.eq("visibility", "public")');
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
