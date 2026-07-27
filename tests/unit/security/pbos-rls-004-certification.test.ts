import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDirectory = join(process.cwd(), "supabase/migrations");
const migrations = readdirSync(migrationsDirectory)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(join(migrationsDirectory, file), "utf8"))
  .join("\n");
const authorizationMigration = readFileSync(
  join(
    migrationsDirectory,
    "202607270001_pbos_authorization_foundation.sql",
  ),
  "utf8",
);
const currentStateAudit = readFileSync(
  join(process.cwd(), "docs/security/PBOS_RLS_CURRENT_STATE_AUDIT.md"),
  "utf8",
);

function captureAll(pattern: RegExp, source: string): Set<string> {
  return new Set(Array.from(source.matchAll(pattern), (match) => match[1]));
}

describe("PBOS-RLS-004 static certification controls", () => {
  it("enables RLS for every table created by checked-in migrations", () => {
    const createdTables = captureAll(
      /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z_][\w]*)/gi,
      migrations,
    );
    const rlsTables = captureAll(
      /alter\s+table\s+(?:only\s+)?(?:public\.)?([a-zA-Z_][\w]*)\s+enable\s+row\s+level\s+security/gi,
      migrations,
    );

    expect(createdTables.size).toBeGreaterThan(0);
    expect([...createdTables].filter((table) => !rlsTables.has(table))).toEqual(
      [],
    );
  });

  it("keeps unresolved roles without permission grants", () => {
    const grants = authorizationMigration.match(
      /insert into public\.authorization_role_permissions[\s\S]*?on conflict do nothing;/,
    )?.[0];

    expect(grants).toBeDefined();
    for (const role of [
      "coach",
      "college-coach",
      "college-admissions",
      "brand-partner",
      "other",
    ]) {
      expect(grants).not.toContain(`('${role}',`);
    }
  });

  it("enforces expiration, revocation, verification, and consent in delegation decisions", () => {
    for (const predicate of [
      "relationship.status = 'active'",
      "relationship.verification_status = 'verified'",
      "relationship.expires_at > now()",
      "relationship.revoked_at is null",
      "consent.status = 'granted'",
      "consent.expires_at > now()",
      "consent.revoked_at is null",
      "membership.status = 'active'",
      "organization.status = 'verified'",
      "membership.expires_at > now()",
      "membership.revoked_at is null",
    ]) {
      expect(authorizationMigration).toContain(predicate);
    }
  });

  it("keeps security audit and verification tables closed to authenticated users", () => {
    for (const table of [
      "authorization_audit_events",
      "authorization_verifications",
    ]) {
      expect(authorizationMigration).toContain(
        `alter table public.${table} enable row level security;`,
      );
      expect(authorizationMigration).not.toMatch(
        new RegExp(`create policy[\\s\\S]*?on public\\.${table}`),
      );
    }
  });

  it("documents every current service-role route", () => {
    const routeFiles: string[] = [];
    const walk = (directory: string) => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) walk(path);
        if (
          entry.isFile() &&
          entry.name === "route.ts" &&
          readFileSync(path, "utf8").includes("SUPABASE_SERVICE_ROLE_KEY")
        ) {
          routeFiles.push(path.slice(process.cwd().length + 1));
        }
      }
    };
    walk(join(process.cwd(), "app/api"));

    expect(routeFiles).toHaveLength(22);
    for (const route of routeFiles) {
      expect(currentStateAudit).toContain(`\`${route}\``);
    }
  });

  it("keeps effective role and verification updates server-controlled", () => {
    expect(authorizationMigration).toContain(
      "revoke update (role, verification_status) on public.profiles from authenticated;",
    );
  });
});
