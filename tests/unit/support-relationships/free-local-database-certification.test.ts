import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const workflow = fs.readFileSync(
  path.join(process.cwd(), ".github/workflows/database-certification.yml"),
  "utf8"
);

const config = fs.readFileSync(
  path.join(process.cwd(), "supabase/config.toml"),
  "utf8"
);

describe("free local database certification", () => {
  it("boots and certifies an isolated local Supabase stack", () => {
    expect(workflow).toContain("supabase start");
    expect(workflow).toContain("supabase db reset --local");
    expect(workflow).toContain("supabase migration list --local");
    expect(workflow).toContain("relationship_authority_preflight.sql");
    expect(workflow).toContain("support_invitation_authority_preflight.sql");
    expect(workflow).toContain("supabase stop --no-backup");
  });

  it("never links, pushes, resets, or addresses the hosted Playbook project", () => {
    expect(workflow).not.toContain("--linked");
    expect(workflow).not.toContain("supabase link");
    expect(workflow).not.toContain("supabase db push");
    expect(workflow).not.toContain("oexgxnybeixwadgtdtzp");
    expect(workflow).not.toContain("SUPABASE_ACCESS_TOKEN");
  });

  it("uses an explicitly local project identity", () => {
    expect(config).toContain('project_id = "playbook-platform-local"');
    expect(config).not.toContain("oexgxnybeixwadgtdtzp");
  });
});
