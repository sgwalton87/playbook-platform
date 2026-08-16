import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getOnboardingCompletionDestination,
  getOnboardingCompletionEndpoint,
  normalizeOnboardingRole,
} from "@/lib/onboarding";
import { getRoleOnboardingCompletionContract } from "@/lib/onboarding/completionRegistry";

describe("Community Partner public onboarding contract", () => {
  it("keeps the durable compatibility role while exposing the public Community Partner slug", () => {
    expect(normalizeOnboardingRole("community-partner")).toBe("other");
    expect(getOnboardingCompletionEndpoint("community-partner")).toBe(
      "/api/pbos/onboarding/community-partner"
    );
    expect(getOnboardingCompletionDestination("community-partner")).toBe(
      "/community-partner-os"
    );
  });

  it("registers the public endpoint against the fail-closed Community Partner authority contract", () => {
    const contract = getRoleOnboardingCompletionContract("other");
    expect(contract.endpoint).toBe("/api/pbos/onboarding/community-partner");
    expect(contract.destination).toBe("/community-partner-os");
    expect(contract.adapter).toBe("COMMUNITY_PARTNER_AUTHORITY");
    expect(contract.state).toBe("authority-pending");
  });

  it("exposes an explicit static route rather than relying on a legacy-looking /other URL", () => {
    const route = fs.readFileSync(
      path.join(
        process.cwd(),
        "app/api/pbos/onboarding/community-partner/route.ts"
      ),
      "utf8"
    );
    expect(route).toContain("completeRoleOnboarding");
  });
});
