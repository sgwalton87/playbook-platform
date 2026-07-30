import { describe, expect, it } from "vitest";
import { AuthorityLedger } from "./ledger";

function approval() {
  return {
    approval_id: "APPROVAL-001",
    request_id: "REQUEST-001",
    package_id: "PACKAGE-001",
    package_digest: "a".repeat(64),
    context_digest: "b".repeat(64),
    requested_by: "requester",
    approved_by: "approver",
    authority_type: "HUMAN",
    risk_level: "YELLOW" as const,
    scope: ["docs/release-evidence"],
    decision: "APPROVED" as const,
    timestamp: "2026-07-30T00:00:00.000Z",
    expiration: null,
  };
}

describe("authority ledger", () => {
  it("rejects self approval", () => {
    expect(() =>
      new AuthorityLedger().appendApproval({
        ...approval(),
        approved_by: "requester",
      })
    ).toThrow("rejected approval");
  });

  it("binds authorization to approval, package, and context identity", () => {
    const ledger = new AuthorityLedger().appendApproval(approval());
    expect(() =>
      ledger.appendAuthorization({
        authorization_id: "AUTH-001",
        approval_id: "APPROVAL-001",
        package_digest: "x".repeat(64),
        context_digest: "b".repeat(64),
        valid_from: "2026-07-30T00:00:00.000Z",
        valid_until: null,
      })
    ).toThrow("rejected authorization");
  });
});
