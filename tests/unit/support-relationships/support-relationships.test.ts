import { describe, expect, it } from "vitest";
import { buildSupportRelationship } from "@/lib/support-relationships";

describe("Support Relationships", () => {
  it("builds relationship with permissions and destination", () => {
    const relationship = buildSupportRelationship({
      scholarId: "scholar-1",
      supporterEmail: "coach@example.com",
      supporterName: "Coach",
      relationship: "mentor",
    });

    expect(relationship.permissions).toContain("support_tasks");
    expect(relationship.destination).toBe("/mentor-os");
  });
});
