import { describe, expect, it } from "vitest";
import {
  buildSharedActionRecord,
  buildSupportMessageRecord,
  canAccessScholarNetwork,
  suggestActionUpdateFromMessage,
} from "@/lib/support-network-live/server";

describe("Support Network Messaging v2", () => {
  it("validates relationship access", () => {
    expect(
      canAccessScholarNetwork({
        scholarId: "scholar-1",
        userEmail: "family@example.com",
        relationships: [
          {
            scholar_id: "scholar-1",
            supporter_email: "family@example.com",
          },
        ],
      })
    ).toBe(true);
  });

  it("always lets the scholar open their own network thread", () => {
    expect(canAccessScholarNetwork({
      scholarId: "scholar-1",
      userId: "scholar-1",
      relationships: [],
    })).toBe(true);
  });

  it("builds support message record", () => {
    expect(
      buildSupportMessageRecord({
        scholarId: "scholar-1",
        senderRole: "mentor",
        body: "Let's practice.",
      }).body
    ).toContain("practice");
  });

  it("builds shared action record", () => {
    expect(
      buildSharedActionRecord({
        scholarId: "scholar-1",
        assignedRole: "family",
        title: "Upload docs",
      }).status
    ).toBe("open");
  });

  it("suggests action update from email text", () => {
    expect(suggestActionUpdateFromMessage("I uploaded the documents").suggestedStatus).toBe("complete");
  });
});
