import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getOnboardingSteps } from "@/lib/onboarding/engine";

describe("Support Network invitation consent boundary", () => {
  it("treats supporter emails as onboarding planning answers, not invitations", () => {
    const fields = getOnboardingSteps("scholar").flatMap(step => step.fields);
    expect(fields.some(field => field.key === "invite_supporters")).toBe(true);
  });

  it("never sends invitations as a side effect of advancing onboarding", () => {
    const source = readFileSync(resolve(process.cwd(), "app/start/page.tsx"), "utf8");
    expect(source).not.toContain('fetch("/api/invitations/send"');
    expect(source).not.toContain("await sendInvites()");
  });
});
