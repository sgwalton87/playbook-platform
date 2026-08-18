import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const messagesPage = readFileSync("app/messages/page.tsx", "utf8");
const meetingPage = readFileSync("app/messages/meeting-links/page.tsx", "utf8");
const spec = readFileSync("docs/ENGINEERING/MESSAGING_MEETING_LINKS_SPEC.md", "utf8");

describe("Messaging Meeting Links MVP", () => {
  it("is discoverable from canonical Messaging", () => {
    expect(messagesPage).toContain('href="/messages/meeting-links"');
    expect(messagesPage).toContain("Share meeting link");
  });

  it("reuses support, Network, and group Messaging instead of a duplicate meeting datastore", () => {
    expect(meetingPage).toContain('loadKind("/api/support-network/messages", "support")');
    expect(meetingPage).toContain('loadKind("/api/network/messages", "network")');
    expect(meetingPage).toContain('loadKind("/api/groups/messages", "group")');
    expect(meetingPage).toContain('action: "SEND"');
    expect(spec).toContain("`pbos_messages` remains the canonical persisted Messaging record");
    expect(spec).toContain("does not create a parallel calendar");
  });

  it("requires HTTPS and rejects credential-bearing URLs before send", () => {
    expect(meetingPage).toContain('parsed.protocol !== "https:"');
    expect(meetingPage).toContain("parsed.username || parsed.password");
    expect(meetingPage).toContain("Meeting links must use HTTPS.");
  });

  it("keeps existing governed delivery and user feedback", () => {
    expect(meetingPage).toContain("requestId: crypto.randomUUID()");
    expect(meetingPage).toContain('role="status"');
    expect(meetingPage).toContain('role="alert"');
    expect(meetingPage).toContain("Meeting link shared in");
    expect(meetingPage).not.toContain("service_role");
  });
});
