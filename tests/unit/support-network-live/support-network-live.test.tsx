import { describe, expect, it } from "vitest";
import {
  createSharedAction,
  createSupportMessage,
  getDemoSharedActions,
  getDemoSupportThread,
} from "@/lib/support-network-live";
import SupportNetworkLiveCenter from "@/components/support-network-live/SupportNetworkLiveCenter";

describe("Support Network Messaging + Shared Actions", () => {
  it("creates free text support message", () => {
    expect(createSupportMessage({
      scholarId: "scholar-1",
      senderRole: "mentor",
      body: "Let's practice.",
    }).body).toContain("practice");
  });

  it("creates shared action", () => {
    expect(createSharedAction({
      scholarId: "scholar-1",
      assignedRole: "family",
      title: "Upload FAFSA docs",
    }).status).toBe("open");
  });

  it("returns demo data", () => {
    expect(getDemoSharedActions().length).toBeGreaterThan(0);
    expect(getDemoSupportThread().length).toBeGreaterThan(0);
  });

  it("component is defined", () => {
    expect(SupportNetworkLiveCenter).toBeTruthy();
  });
});
