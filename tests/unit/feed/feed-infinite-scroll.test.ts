import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { appendUniqueFeedRows, chunkFeedIds, FEED_IDENTITY_BATCH_SIZE, FEED_PAGE_SIZE } from "@/lib/feed/pagination";

const feed = readFileSync("app/feed/page.tsx", "utf8");
const publicFeed = readFileSync("components/public/PublicNewsFeed.tsx", "utf8");
const migration = readFileSync("supabase/migrations/202608170093_feed_infinite_scroll.sql", "utf8");
const workflow = readFileSync(".github/workflows/database-certification.yml", "utf8");
const spec = readFileSync("docs/ENGINEERING/FEED_INFINITE_SCROLL_SPEC.md", "utf8");

describe("Feed Infinite Scroll", () => {
  it("uses one deterministic SECURITY INVOKER cursor service for both Feed surfaces", () => {
    expect(migration).toContain("security invoker");
    expect(migration).toContain("(fp.created_at, fp.id) < (p_cursor_created_at, p_cursor_id)");
    expect(migration).toContain("order by fp.created_at desc, fp.id desc");
    expect(migration).toContain("least(greatest(coalesce(p_page_size, 20), 1), 50)");
    expect(feed).toContain('rpc("get_feed_page"');
    expect(publicFeed).toContain('rpc("get_feed_page"');
    expect(workflow).toContain("Certify Feed Infinite Scroll");
    expect(spec).toContain("No service-role or SECURITY DEFINER visibility bypass is permitted for pagination.");
  });

  it("removes fixed total post caps and silently truncated identity hydration", () => {
    expect(FEED_PAGE_SIZE).toBe(20);
    expect(FEED_IDENTITY_BATCH_SIZE).toBe(100);
    expect(feed).not.toContain('.limit(50)');
    expect(publicFeed).not.toContain('.limit(30)');
    expect(feed).not.toContain('.slice(0, 100)');
    expect(publicFeed).not.toContain('.slice(0, 100)');
    expect(feed).toContain("chunkFeedIds");
    expect(publicFeed).toContain("chunkFeedIds");
  });

  it("batches identities without dropping IDs", () => {
    const ids = Array.from({ length: 205 }, (_, index) => `id-${index}`);
    const chunks = chunkFeedIds([...ids, ids[0]], 100);
    expect(chunks.map((chunk) => chunk.length)).toEqual([100, 100, 5]);
    expect(chunks.flat()).toEqual(ids);
  });

  it("de-duplicates appended pages by canonical post ID", () => {
    const current = [{ id: "a", value: 1 }, { id: "b", value: 2 }];
    const incoming = [{ id: "b", value: 3 }, { id: "c", value: 4 }];
    expect(appendUniqueFeedRows(current, incoming)).toEqual([
      { id: "a", value: 1 },
      { id: "b", value: 3 },
      { id: "c", value: 4 },
    ]);
  });

  it("loads later pages through viewport sentinels with visible progress feedback", () => {
    expect(feed).toContain("new IntersectionObserver");
    expect(feed).toContain("feedSentinelRef");
    expect(feed).toContain("Loading more stories…");
    expect(feed).toContain("You reached the end of the timeline.");
    expect(publicFeed).toContain("new IntersectionObserver");
    expect(publicFeed).toContain("sentinelRef");
    expect(publicFeed).toContain("Loading more community stories…");
    expect(publicFeed).toContain("You reached the end of the public timeline.");
  });
});
