import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const feedPage = readFileSync("app/feed/page.tsx", "utf8");
const identityMigration = readFileSync("supabase/migrations/202608170086_feed_author_identity_privacy_convergence.sql", "utf8");
const publicPrivacyMigration = readFileSync("supabase/migrations/202608160078_public_profile_privacy_fail_closed.sql", "utf8");

describe("Feed Profile Links authority", () => {
  it("renders the canonical public-profile route only when a projected username exists", () => {
    expect(feedPage).toContain('post.username && <div><Link href={`/u/${post.username}`}');
    expect(feedPage).toContain('username: identity?.username || null');
    expect(feedPage).toContain('author: identity ? displayName(identity) : "Playbook member"');
  });

  it("derives linkability from the consent-aware Feed identity projection", () => {
    expect(feedPage).toContain('rpc("get_public_member_identities"');
    expect(identityMigration).toContain("public_profile_publication_consents");
    expect(identityMigration).toContain("public-profile-v1");
    expect(identityMigration).toContain("consent.revoked_at is null");
  });

  it("keeps the canonical profile route fail closed for non-owner unpublished profiles", () => {
    expect(publicPrivacyMigration).toContain("get_public_scholar_profile");
    expect(publicPrivacyMigration).toContain("p.id=auth.uid()");
    expect(publicPrivacyMigration).toContain("public-profile-v1");
    expect(publicPrivacyMigration).toContain("c.revoked_at is null");
  });
});
