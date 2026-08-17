import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const feedPage = readFileSync("app/feed/page.tsx", "utf8");
const migration = readFileSync("supabase/migrations/202608170088_feed_image_posts_media_authority.sql", "utf8");
const spec = readFileSync("docs/ENGINEERING/FEED_IMAGE_POSTS_SPEC.md", "utf8");

describe("Feed Image Posts authority", () => {
  it("keeps the Feed composer on the shared photos service with image-only browser guidance", () => {
    expect(feedPage).toContain('supabase.storage.from("photos").upload');
    expect(feedPage).toContain('accept="image/png,image/jpeg,image/webp"');
    expect(feedPage).toContain('const path = `${userId}/${folder}/');
    expect(feedPage).toContain('folder: "feed" | "gallery"');
    expect(feedPage).toContain('if (upload.error) throw new Error(upload.error.message)');
  });

  it("makes Storage, not browser hints, the authoritative MIME and size boundary", () => {
    expect(migration).toContain("10485760");
    expect(migration).toContain("image/jpeg");
    expect(migration).toContain("image/png");
    expect(migration).toContain("image/webp");
    expect(migration).toContain("photos_owner_upload");
    expect(migration).toContain("photos_public_read");
    expect(spec).toContain("Browser `accept=` is usability guidance, not authorization.");
    expect(spec).toContain("Storage policy and bucket configuration are authoritative.");
  });
});
