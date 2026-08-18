import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const startPage = fs.readFileSync(
  path.join(process.cwd(), "app/start/page.tsx"),
  "utf8"
);

const roleRoute = fs.readFileSync(
  path.join(process.cwd(), "app/api/pbos/onboarding/[role]/route.ts"),
  "utf8"
);

describe("Start onboarding canonical client cutover", () => {
  it("submits completion through the authenticated role-specific endpoint", () => {
    expect(startPage).toContain("/api/pbos/onboarding/${encodeURIComponent(role)}");
    expect(startPage).not.toContain('fetch("/api/pbos/scholar/onboarding"');
    expect(roleRoute).toContain("durableRole !== endpointRole");
  });

  it("does not let the client mark onboarding complete before the server succeeds", () => {
    expect(startPage).not.toContain("await persist(true)");
    expect(startPage).toContain("await persist(false, {}, true)");
    expect(startPage).toContain("leave onboarding completion false until the governed server adapter succeeds");
  });

  it("cross-checks the server destination and navigates through the canonical Next router", () => {
    expect(startPage).toContain("const router = useRouter()");
    expect(startPage).toContain("const destination = getOnboardingCompletionDestination(role)");
    expect(startPage).toContain("result.destination && result.destination !== destination");
    expect(startPage).toContain("router.replace(result.destination || destination)");
    expect(startPage).not.toContain("window.location.href");
  });
});
