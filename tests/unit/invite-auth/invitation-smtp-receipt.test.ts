// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireUser: vi.fn(), send: vi.fn(), persist: vi.fn(), insert: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/email", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/email")>(),
  sendPlaybookEmail: mocks.send,
}));
vi.mock("@/lib/invitations/smtp-receipt", () => ({ recordSupportInvitationSmtpReceipt: mocks.persist }));

import { POST } from "@/app/api/invitations/send/route";

const recipient = "supporter@example.invalid";
const request = () => new NextRequest("http://localhost/api/invitations/send", {
  method: "POST",
  body: JSON.stringify({ inviteeName: "Synthetic Supporter", inviteeEmail: recipient, relationship: "mentor" }),
});

describe("invitation SMTP receipt", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv("SMTP_HOST", "127.0.0.1");
    vi.stubEnv("SMTP_USER", "synthetic");
    vi.stubEnv("SMTP_PASS", "synthetic");
    const profile = { select: () => profile, eq: () => profile,
      maybeSingle: async () => ({ data: { role: "scholar", full_name: "Synthetic Scholar" }, error: null }) };
    mocks.insert.mockResolvedValue({ error: null });
    mocks.requireUser.mockResolvedValue({ user: { id: "scholar", email: "scholar@example.invalid" },
      supabase: { from: (table: string) => table === "profiles" ? profile : { insert: mocks.insert } } });
    mocks.send.mockResolvedValue({ accepted: [recipient], messageId: "<smtp-id@example.invalid>" });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("persists the accepted SMTP message ID against the exact inserted invitation", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.deliveryReceiptStatus).toBe("recorded");
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ id: result.invitation.id }));
    expect(mocks.persist).toHaveBeenCalledExactlyOnceWith(result.invitation.id, "smtp-id@example.invalid");
  });

  it("preserves SMTP acceptance and the Scholar copy when receipt persistence fails", async () => {
    mocks.persist.mockRejectedValueOnce(new Error("unavailable"));
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      deliveryStatus: "sent", deliveryReceiptStatus: "unavailable", scholarReceiptStatus: "sent",
    });
    expect(mocks.send).toHaveBeenCalledTimes(2);
  });

  it("does not persist a receipt for an unaccepted recipient", async () => {
    mocks.send.mockResolvedValueOnce({ accepted: [], messageId: "<id@example.invalid>" });
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ deliveryStatus: "failed", deliveryReceiptStatus: "not_sent" });
    expect(mocks.persist).not.toHaveBeenCalled();
  });
});
