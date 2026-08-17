import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const startSource = readFileSync("app/start/page.tsx", "utf8");
const profileSource = readFileSync("app/profile/page.tsx", "utf8");

describe("onboarding and profile persistence audit contracts", () => {
  it("debounces onboarding autosave through the existing owner-scoped profile path", () => {
    expect(startSource).toContain("autosaveTimerRef");
    expect(startSource).toContain("autosaveQueueRef");
    expect(startSource).toContain("Your onboarding answers could not be saved");
    expect(startSource).toContain("onboarding_step_index: stepIndex");
    expect(startSource).toContain("await autosaveQueueRef.current.catch");
  });

  it("does not imply onboarding automatically publishes a public profile", () => {
    expect(startSource).toContain("Your answers autosave to your private Scholar Record");
    expect(startSource).toContain("You choose separately whether to publish a public profile");
    expect(startSource).not.toContain("feed your dashboard, private profile, and public-facing profile");
  });

  it("requires a confirmed profile row before reporting save success", () => {
    expect(profileSource).toContain('.select("id").maybeSingle()');
    expect(profileSource).toContain("if(error || !updated)");
    expect(profileSource).toContain('role="alert"');
  });
});
