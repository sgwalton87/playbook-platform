import { describe, expect, it } from "vitest";
import CanonicalPublicFooter from "@/components/public/CanonicalPublicFooter";

describe("canonical public footer", () => {
  it("provides one reusable public web footer", () => {
    expect(CanonicalPublicFooter).toBeTruthy();
  });
});
