import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

const publicProfile = read("app/u/[username]/page.tsx");
const feed = read("app/feed/page.tsx");
const migration = read("supabase/migrations/202608160030_public_scholar_record_projection.sql");

describe("public Scholar Record projection", () => {
  it("routes public profile reads through the bounded Scholar projection", () => {
    expect(publicProfile).toContain('rpc("get_public_scholar_profile"');
    expect(publicProfile).not.toContain('.from("profiles").select("*")');
    expect(publicProfile).not.toContain('.storage.from("photos").list("gallery"');
    expect(publicProfile).toContain('const galleryPrefix=`${profileData.id}/gallery`');
  });

  it("keeps shared Feed identity enrichment off the canonical profiles table", () => {
    expect(feed).toContain('rpc("get_public_scholar_identities"');
    expect(feed).not.toContain('.from("profiles").select("id,first_name,last_name,full_name,username,role,avatar_url").in(');
    expect(feed).toContain('const galleryPrefix=`${u.user.id}/gallery`');
    expect(feed).toContain('const filename=`${userId}/${folder}/');
  });

  it("exposes only learner public projections and fixes public feed/media policy", () => {
    expect(migration).toContain("get_public_scholar_profile");
    expect(migration).toContain("get_public_scholar_identities");
    expect(migration).toContain("in ('scholar', 'scholar-athlete', 'transition-youth')");
    expect(migration).toContain("p.profile_visibility = 'public'");
    expect(migration).not.toMatch(/returns table[\s\S]*\bverification_status\b/i);
    expect(migration).not.toMatch(/returns table[\s\S]*\bonboarding_completed\b/i);
    expect(migration).not.toMatch(/returns table[\s\S]*\bis_admin\b/i);
    expect(migration).toContain('using (visibility = \'public\')');
    expect(migration).toContain('Authenticated users upload own public photos');
    expect(migration).toContain("(storage.foldername(name))[1] = (select auth.uid())::text");
  });
});
