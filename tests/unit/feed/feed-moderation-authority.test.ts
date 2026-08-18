import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608170094_feed_moderation_authority.sql", "utf8");
const reportRoute = readFileSync("app/api/trust/report/route.ts", "utf8");
const adminRoute = readFileSync("app/api/admin/moderation/route.ts", "utf8");
const adminPage = readFileSync("app/admin/moderation/page.tsx", "utf8");
const storyPage = readFileSync("app/story/[id]/page.tsx", "utf8");
const reportControl = readFileSync("components/feed/ReportStoryControl.tsx", "utf8");
const spec = readFileSync("docs/ENGINEERING/FEED_MODERATION_SPEC.md", "utf8");

describe("Feed Moderation authority", () => {
  it("reuses the canonical Trust & Safety tables and adds only Feed enforcement state", () => {
    expect(migration).toContain("moderation_state text not null default 'visible'");
    expect(migration).toContain("moderation_actions");
    expect(migration).toContain("moderation_reports");
    expect(migration).not.toContain("create table public.feed_moderation");
    expect(spec).toContain("No duplicate moderation table");
  });

  it("keeps public reads fail-closed and moderator review off general Feed RLS", () => {
    expect(migration).toContain("visibility = 'public' and moderation_state = 'visible'");
    expect(migration).toContain("feed_posts_select_owner");
    expect(migration).toContain("drop policy if exists feed_posts_select_moderator");
    expect(migration).not.toContain("create policy feed_posts_select_moderator");
    expect(migration).toContain("get_moderation_feed_posts");
    expect(adminRoute).toContain('rpc("get_moderation_feed_posts"');
    expect(spec).toContain("Moderator review shall not widen general Feed RLS");
    expect(storyPage).toContain('.eq("moderation_state", "visible")');
    expect(storyPage).toContain("private, moderated, removed, or unavailable");
  });

  it("provides a governed report workflow over visible Feed posts", () => {
    expect(reportRoute).toContain('targetType === "post"');
    expect(reportRoute).toContain('.eq("visibility", "public")');
    expect(reportRoute).toContain('.eq("moderation_state", "visible")');
    expect(reportControl).toContain('fetch("/api/trust/report"');
    expect(reportControl).toContain('targetType: "post"');
    expect(reportControl).toContain("Report submitted to Playbook Trust & Safety.");
    expect(storyPage).toContain("<ReportStoryControl postId={story.id} />");
  });

  it("binds hide and restore to human moderator authority and audit evidence", () => {
    expect(migration).toContain("private.current_user_is_platform_moderator()");
    expect(migration).toContain("p_action not in ('hide_content','restore_content')");
    expect(migration).toContain("insert into public.moderation_actions");
    expect(migration).toContain("grant execute on function public.moderate_feed_post");
    expect(migration).toContain("grant execute on function public.get_moderation_feed_posts");
    expect(adminRoute).toContain('action === "hide_content" || action === "restore_content"');
    expect(adminRoute).toContain('rpc("moderate_feed_post"');
    expect(adminPage).toContain("Hide story");
    expect(adminPage).toContain("Restore story");
  });

  it("keeps resolved hidden reports reachable for human restore", () => {
    expect(adminRoute).toContain('.in("status", ["open", "reviewing", "resolved"])');
    expect(adminRoute).toContain('report.status !== "resolved" || report.target_moderation_state === "hidden"');
  });

  it("does not reopen direct Feed UPDATE authority", () => {
    expect(migration).toContain("revoke update on table public.feed_posts from public, anon, authenticated");
    expect(spec).toContain("Direct authenticated `UPDATE` on Feed moderation fields remains unavailable");
  });
});
