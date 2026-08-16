import { describe, expect, it } from "vitest";
import { resolveAuthCallbackRole } from "@/lib/auth/callbackRole";

describe("auth callback role resolution", () => {
  it("preserves an existing durable profile even when mutable metadata disagrees", () => {
    expect(resolveAuthCallbackRole({
      existingProfileMode: "mentor",
      existingProfileRole: "mentor",
      verifiedSignupRole: "scholar",
      googleRequestedRole: "family",
      metadataProfileMode: "college-admissions",
    })).toBe("mentor");
  });

  it("uses the newly verified signup selection when no durable profile exists", () => {
    expect(resolveAuthCallbackRole({
      verifiedSignupRole: "parent",
      metadataProfileMode: "scholar",
    })).toBe("family");
  });

  it("preserves Community Partner as a first-class callback role", () => {
    expect(resolveAuthCallbackRole({
      googleRequestedRole: "other",
    })).toBe("other");
  });

  it("fails closed when callback role evidence is missing or unknown", () => {
    expect(() => resolveAuthCallbackRole({})).toThrow("role is required");
    expect(() => resolveAuthCallbackRole({ metadataRole: "unknown-role" }))
      .toThrow("Unsupported Playbook role");
  });
});
