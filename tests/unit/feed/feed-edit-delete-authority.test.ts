import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (value: string) => fs.readFileSync(path.join(root, value), "utf8");

const migration = read("supabase/migrations/202608170092_feed_edit_delete_authority.sql");
const route = read("app/api/social/posts/route.ts");
const feed = read("app/feed/page.tsx");
const spec = read("docs/ENGINEERING/FEED_EDIT_DELETE_SPEC.md");

describe("Feed Edit and Delete authority", () => {
  it("keeps direct feed_posts UPDATE and DELETE revoked", () => {
    expect(migration).toContain("revoke update, delete on table public.feed_posts");
    expect(migration).toContain("update_feed_post_owner");
    expect(migration).toContain("delete_feed_post_owner");
    expect(spec).toContain("Direct authenticated `UPDATE` and `DELETE` on `feed_posts` remain revoked");
  });

  it("restricts edit to text/category while preserving media and visibility", () => {
    expect(migration).toContain("set body = btrim(coalesce(p_body,''))");
    expect(migration).toContain("post_type = btrim(p_post_type)");
    expect(migration).not.toContain("visibility = p_");
    expect(route).toContain('method: "PATCH"').or;
    expect(feed).toContain("Edit changes story text and category only. Existing visibility and media stay unchanged.");
  });

  it("routes owner lifecycle actions through the governed API", () => {
    expect(feed).toContain('fetch("/api/social/posts", {');
    expect(feed).toContain('method: "PATCH"');
    expect(feed).toContain('method: "DELETE"');
    expect(feed).toContain("post.userId === userId");
    expect(feed).toContain("Edit post");
    expect(feed).toContain("Delete post");
    expect(feed).toContain("window.confirm");
  });

  it("limits media deletion to owner Feed namespaces and surfaces cleanup failures", () => {
    expect(migration).toContain("feed_photos_owner_delete");
    expect(migration).toContain("feed_videos_owner_delete");
    expect(migration).toContain("(storage.foldername(name))[2]='feed'");
    expect(route).toContain('path.startsWith(`${userId}/feed/`)');
    expect(route).toContain('mediaCleanup: cleanupErrors.length ? "failed" : "complete"');
    expect(feed).toContain("if (result.warning) setError(result.warning)");
  });

  it("preserves canonical cascades by deleting the feed_posts row itself", () => {
    expect(migration).toContain("delete from public.feed_posts");
    expect(migration).toContain("return jsonb_build_object");
    expect(spec).toContain("comments, reactions, and share-completion records");
  });
});
