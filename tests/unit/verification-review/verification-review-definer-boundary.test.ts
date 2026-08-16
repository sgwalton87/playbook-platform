import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const migration = readFileSync(
  join(root, "supabase/migrations/202608160052_verification_review_definer_surface_hardening.sql"),
  "utf8",
);
const route = readFileSync(join(root, "app/api/admin/verification/route.ts"), "utf8");
const page = readFileSync(join(root, "app/admin/page.tsx"), "utf8");

describe("Verification review definer boundary", () => {
  it("keeps cross-user review bodies private behind invoker wrappers", () => {
    expect(migration).toContain("create or replace function private.get_verification_review_queue");
    expect(migration).toContain("create or replace function private.review_verification_request");
    expect(migration).toContain("security definer");
    expect(migration).toContain("create or replace function public.get_verification_review_queue");
    expect(migration).toContain("create or replace function public.review_verification_request");
    expect(migration).toContain("security invoker");
  });

  it("requires an accountable reason for final verification decisions", () => {
    expect(migration).toContain("a decision reason is required for approval or rejection");
    expect(route).toContain("A decision reason is required to approve or reject verification.");
    expect(page).toContain("Record a decision reason before approving or rejecting verification.");
    expect(page).toContain("Required for approval or rejection. Optional while marking a request under review.");
  });

  it("preserves reviewer and role-scope safeguards", () => {
    expect(migration).toContain("current_user_is_verification_reviewer");
    expect(migration).toContain("reviewers cannot approve their own verification request");
    expect(migration).toContain("campaign_scope_approved");
    expect(migration).toContain("service_scope_status");
    expect(migration).toContain("jurisdiction_scope_status");
    expect(migration).toContain("verification_review_events");
  });
});
