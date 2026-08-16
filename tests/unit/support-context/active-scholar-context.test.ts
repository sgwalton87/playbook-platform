import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
const migration = read("supabase/migrations/202608160039_active_support_scholar_context.sql");
const api = read("app/api/support-context/route.ts");
const selector = read("components/shell/ActiveScholarContextSelector.tsx");
const shell = read("components/shell/UnifiedAppShell.tsx");

describe("governed active Scholar context", () => {
  it("anchors selection to an active supporter relationship rather than a free Scholar ID", () => {
    expect(migration).toContain("requested_relationship_id uuid");
    expect(migration).toContain("supporter_id=actor_id");
    expect(migration).toContain("status='active'");
    expect(migration).not.toContain("requested_scholar_id");
    expect(migration).toContain("r.status='active'");
  });

  it("keeps direct context mutation closed and exposes narrow RPCs", () => {
    expect(migration).toContain("revoke insert, update, delete on public.active_support_scholar_contexts from anon, authenticated");
    expect(migration).toContain("set_active_support_scholar_context");
    expect(migration).toContain("get_available_support_scholar_contexts");
    expect(migration).toContain("get_active_support_scholar_context");
  });

  it("routes browser selection only through the governed support-context API", () => {
    expect(api).toContain('rpc("get_available_support_scholar_contexts")');
    expect(api).toContain('rpc("get_active_support_scholar_context")');
    expect(api).toContain('rpc("set_active_support_scholar_context"');
    expect(api).not.toContain('.from("active_support_scholar_contexts").insert');
    expect(api).not.toContain('.from("active_support_scholar_contexts").update');
  });

  it("surfaces the current Scholar focus in the canonical authenticated shell", () => {
    expect(selector).toContain("Working with");
    expect(selector).toContain("Active support relationships only");
    expect(selector).toContain('fetch("/api/support-context"');
    expect(shell).toContain('ActiveScholarContextSelector');
  });
});
