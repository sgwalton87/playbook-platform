import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const startSource = readFileSync("app/start/page.tsx", "utf8");
const profileEntrySource = readFileSync("app/profile/page.tsx", "utf8");
const profileSource = readFileSync("components/profile/RoleProfileEditor.tsx", "utf8");

describe("onboarding and profile persistence audit contracts", () => {
  it("debounces onboarding autosave through the existing owner-scoped profile path", () => {
    expect(startSource).toContain("autosaveTimerRef");
    expect(startSource).toContain("autosaveQueueRef");
    expect(startSource).toContain("Your onboarding answers could not be saved");
    expect(startSource).toContain("onboarding_step_index: stepIndex");
    expect(startSource).toContain("await autosaveQueueRef.current.catch");
  });

  it("does not imply onboarding automatically publishes a public profile", () => {
    expect(startSource).toContain("Your answers autosave to your private Playbook profile for this role");
    expect(startSource).toContain("Any sharing or public visibility is managed separately");
    expect(startSource).not.toContain("feed your dashboard, private profile, and public-facing profile");
  });

  it("requires a confirmed profile row before reporting save success", () => {
    expect(profileSource).toContain('.select("id").maybeSingle()');
    expect(profileEntrySource).toContain('export { default } from "./role/page"');
    expect(profileSource).toContain("if (error || !data)");
    expect(profileSource).toContain('role="alert"');
  });
});
