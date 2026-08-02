import { describe, expect, it } from "vitest";
import { buildCompletionSuccess, validateCompletionPayload } from "@/lib/onboarding";

describe("onboarding completion contract", () => {
  it("does not allow completion without required consent", () => {
    expect(validateCompletionPayload({ full_name: "Maya" })?.code).toBe("safety_agreement_required");
  });
  it("returns a canonical role destination", () => {
    expect(buildCompletionSuccess({ profileId: "p", recordId: "r", role: "district" })).toMatchObject({ ok: true, destination: "/district-os" });
  });
});
