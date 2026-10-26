import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("Application workspace loading recovery", () => {
  const component = readFileSync("components/application-workspace/ApplicationWorkspaceDashboard.tsx", "utf8");
  const route = readFileSync("app/api/application-workspaces/route.ts", "utf8");
  it("offers a retry after a failed workspace read", () => {
    expect(component).toContain("async function retryLoading()");
    expect(component).toContain("await refresh()");
    expect(component).toContain("Retry loading application workspaces");
    expect(component).toContain("disabled={busy}");
  });
  it("retains server-side completed learner authority, ownership scope and onboarding recovery", () => {
    expect(route).toContain("requireLearnerAuthority(supabase, user.id, { requireOnboarding: true })");
    expect(route).toContain('.eq("scholar_id", user.id)');
    expect(route).toContain('action: "complete_onboarding"');
    expect(component).toContain('href="/start"');
  });
});
