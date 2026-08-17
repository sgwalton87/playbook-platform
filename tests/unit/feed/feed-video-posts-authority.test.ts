import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const feedPage = readFileSync("app/feed/page.tsx", "utf8");
const publicFeed = readFileSync("components/public/PublicNewsFeed.tsx", "utf8");
const migration = readFileSync("supabase/migrations/202608170090_feed_video_posts_media_authority.sql", "utf8");
const spec = readFileSync("docs/ENGINEERING/FEED_VIDEO_POSTS_SPEC.md", "utf8");

describe("Feed Video Posts authority", () => {
  it("uses one governed shared public-video storage boundary", () => {
    expect(migration).toContain("'feed-videos'");
    expect(migration).toContain("52428800");
    expect(migration).toContain("video/mp4");
    expect(migration).toContain("video/webm");
    expect(migration).toContain("video/quicktime");
    expect(migration).toContain("feed_videos_owner_upload");
    expect(migration).toContain("storage.foldername(name)");
    expect(spec).toContain("feed_posts.media_url");
    expect(spec).toContain("feed_posts.media_type = 'video'");
  });

  it("publishes video through canonical feed_posts instead of an image fallback", () => {
    expect(feedPage).toContain('supabase.storage.from("feed-videos").upload');
    expect(feedPage).toContain('media_type: isVideo ? "video"');
    expect(feedPage).toContain('media_url: videoUrl');
    expect(feedPage).toContain('image_url: imageUrl');
    expect(feedPage).toContain('accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"');
    expect(feedPage).toContain('pendingMediaKind === "video"');
  });

  it("renders videos correctly in authenticated and public Feed surfaces", () => {
    expect(feedPage).toContain('post.mediaType === "video" && post.mediaUrl');
    expect(feedPage).toContain('<video controls preload="metadata"');
    expect(publicFeed).toContain('media_type');
    expect(publicFeed).toContain('const video = post.media_type === "video"');
    expect(publicFeed).toContain('post.mediaType === "video" && post.mediaUrl');
    expect(publicFeed).toContain('<video controls preload="metadata"');
    expect(publicFeed).toContain('imageUrl: video ? null');
  });
});
