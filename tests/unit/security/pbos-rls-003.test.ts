import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationPath = join(
  process.cwd(),
  "supabase/migrations/202607270001_pbos_authorization_foundation.sql",
);
const migration = readFileSync(migrationPath, "utf8");

describe("PBOS-RLS-003 authorization foundation", () => {
  it("enables RLS on every authorization table", () => {
    const tables = [
      "authorization_roles",
      "authorization_permissions",
      "authorization_role_permissions",
      "authorization_role_assignments",
      "authorization_organizations",
      "authorization_organization_memberships",
      "authorization_consents",
      "authorization_verifications",
      "authorization_relationships",
      "authorization_delegations",
      "authorization_audit_events",
    ];

    for (const table of tables) {
      expect(migration).toContain(
        `alter table public.${table} enable row level security;`,
      );
    }
  });

  it("implements fail-closed relationship and consent checks", () => {
    expect(migration).toContain("relationship.status = 'active'");
    expect(migration).toContain("relationship.verification_status = 'verified'");
    expect(migration).toContain("relationship.expires_at > now()");
    expect(migration).toContain("relationship.revoked_at is null");
    expect(migration).toContain("consent.status = 'granted'");
    expect(migration).toContain("consent.expires_at > now()");
    expect(migration).toContain("consent.revoked_at is null");
  });

  it("seeds only the existing permission identifiers", () => {
    const expectedPermissions = [
      "view_progress",
      "view_verified_record",
      "view_deadlines",
      "support_tasks",
      "verify_evidence",
      "recommend_actions",
      "view_cohort",
      "view_equity_metrics",
      "create_opportunities",
      "review_candidates",
    ];
    const permissionSeed = migration.match(
      /insert into public\.authorization_permissions[\s\S]*?on conflict \(id\)/,
    )?.[0];

    expect(permissionSeed).toBeDefined();
    for (const permission of expectedPermissions) {
      expect(permissionSeed).toContain(`('${permission}'`);
    }
    expect(permissionSeed?.match(/^  \('/gm)).toHaveLength(
      expectedPermissions.length,
    );
  });

  it("does not grant unresolved coach, institution, or brand permissions", () => {
    const grants = migration.match(
      /insert into public\.authorization_role_permissions[\s\S]*?on conflict do nothing;/,
    )?.[0];

    expect(grants).toBeDefined();
    expect(grants).not.toContain("('coach',");
    expect(grants).not.toContain("('college-coach',");
    expect(grants).not.toContain("('college-admissions',");
    expect(grants).not.toContain("('brand-partner',");
    expect(grants).not.toContain("('other',");
  });

  it("does not treat ownership as every registered permission", () => {
    expect(migration).toContain("owner_template.role_id = 'scholar'");
    expect(migration).toContain(
      "owner_template.permission_id = requested_permission",
    );
  });

  it("keeps effective profile role and verification server-governed", () => {
    expect(migration).toContain(
      "revoke update (role, verification_status) on public.profiles from authenticated;",
    );
  });

  it("keeps authorization audit events append-only for authenticated users", () => {
    expect(migration).toContain(
      "alter table public.authorization_audit_events enable row level security;",
    );
    expect(migration).not.toMatch(
      /create policy[\s\S]*?on public\.authorization_audit_events/,
    );
  });
});
