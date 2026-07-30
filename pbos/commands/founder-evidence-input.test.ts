import { describe, expect, it } from "vitest";
import {
  collectFounderEvidenceInput,
  parseFounderEvidenceArguments,
} from "./founder-evidence-input";

describe("founder evidence input", () => {
  it("parses arguments and normalizes repeated file lists", () => {
    expect(parseFounderEvidenceArguments([
      "--requester-identity", "founder",
      "--approved-files=docs/a.md,docs/b.md",
      "--approved-files", "docs/a.md",
      "--excluded-files", "app/a.ts",
    ])).toEqual({
      "requester-identity": "founder",
      "approved-files": ["docs/a.md", "docs/b.md"],
      "excluded-files": ["app/a.ts"],
    });
  });

  it("collects missing boundary evidence and requires confirmation", async () => {
    const answers = [
      "founder", "Authorize release.", "Bind exact scope.", "docs/a.md",
      "app/a.ts", "RED risk accepted.", "2026-08-01T00:00:00.000Z", "yes",
    ];
    const result = await collectFounderEvidenceInput(
      "change-boundary", {}, async () => answers.shift() ?? ""
    );
    expect(result["requester-identity"]).toBe("founder");
    expect(result["approved-files"]).toEqual(["docs/a.md"]);
    expect(result["excluded-files"]).toEqual(["app/a.ts"]);
  });

  it("rejects unconfirmed evidence", async () => {
    await expect(collectFounderEvidenceInput("approve-boundary", {
      "requester-identity": "founder",
      "reviewer-identity": "reviewer",
      decision: "APPROVED",
      reason: "Reviewed.",
      "risk-acknowledgment": "Accepted.",
      expiration: "2026-08-01T00:00:00.000Z",
    }, async () => "no")).rejects.toThrow("not confirmed");
  });
});
