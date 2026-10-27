import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { PbosRuntimeUnavailableError } from "@/pbos/connector/signed-server-transport";

const mocks = vi.hoisted(() => ({
  complete: vi.fn(), rpc: vi.fn(), requireUser: vi.fn(), missing: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({ requireUser: mocks.requireUser }));
vi.mock("@/lib/pbos/activation-config", () => ({ getMissingPbosActivationConfiguration: mocks.missing }));
vi.mock("@/lib/pbos/scholar-onboarding-service", () => ({
  ScholarOnboardingService: class { complete = mocks.complete; },
}));
import { POST } from "@/app/api/pbos/scholar/onboarding/route";

const request = () => new NextRequest("http://localhost/api/pbos/onboarding/scholar", {
  method: "POST", body: JSON.stringify({ displayName: "Example", goalTitle: "Graduate" }),
});

beforeEach(() => {
  vi.resetAllMocks();
  mocks.missing.mockReturnValue([]);
  mocks.rpc.mockResolvedValue({ error: null });
  const profile = { role: "scholar", profile_mode: "scholar", onboarding_completed: false };
  const query = {
    select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: profile, error: null }),
    single: vi.fn().mockResolvedValue({ data: { onboarding_completed_at: "2026-10-26T00:00:00Z" }, error: null }),
  };
  mocks.requireUser.mockResolvedValue({ user: { id: "synthetic-owner" },
    supabase: { from: vi.fn().mockReturnValue(query), rpc: mocks.rpc } });
  for (const key of ["PBOS_API_URL", "PBOS_ORGANIZATION_ID", "PBOS_CONNECTOR_ID", "PBOS_CONNECTOR_KEY_ID",
    "PBOS_CONNECTOR_SECRET_BASE64", "PBOS_SCHOLAR_IDENTITY_APPROVAL_ID", "PBOS_SCHOLAR_EXCHANGE_APPROVAL_ID"]) {
    vi.stubEnv(key, key === "PBOS_API_URL" ? "https://pbos.example/pbos/v1" : "test-only");
  }
});

describe("saved profile versus independent PBOS activation", () => {
  it("reproduces a transport outage and safely completes only the owned profile", async () => {
    mocks.complete.mockRejectedValue(new PbosRuntimeUnavailableError());
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(await response.json()).toMatchObject({ ok: true, onboardingSubmitted: true,
      activationState: "pending-pbos-activation", destination: "/dashboard" });
    expect(mocks.rpc).toHaveBeenCalledExactlyOnceWith("complete_playbook_onboarding", {
      expected_role: "scholar", mark_verification_pending: true,
    });
  });

  it("keeps retries on the same owner and idempotency key", async () => {
    mocks.complete.mockRejectedValueOnce(new PbosRuntimeUnavailableError()).mockResolvedValueOnce({ role: "SCHOLAR" });
    expect((await POST(request())).status).toBe(202);
    expect((await POST(request())).status).toBe(200);
    expect(mocks.complete.mock.calls[0][0]).toEqual(mocks.complete.mock.calls[1][0]);
    expect(mocks.complete.mock.calls[0][0]).toMatchObject({ actorId: "synthetic-owner", ownerId: "synthetic-owner",
      idempotencyKey: "scholar-onboarding-synthetic-owner" });
    expect(mocks.rpc.mock.calls[1][1]).toMatchObject({ mark_verification_pending: false });
  });

  it.each(["Access denied", "PBOS identity role does not match", "PBOS v1 response correlation mismatch", "Persistence failed"])(
    "does not mask %s as completed onboarding", async message => {
      mocks.complete.mockRejectedValue(new Error(message));
      expect((await POST(request())).status).toBe(500);
      expect(mocks.rpc).not.toHaveBeenCalled();
    });

  it("does not report pending success when governed profile completion fails", async () => {
    mocks.complete.mockRejectedValue(new PbosRuntimeUnavailableError());
    mocks.rpc.mockResolvedValue({ error: { message: "Completion denied" } });
    expect((await POST(request())).status).toBe(500);
  });

  it("rejects anonymous calls before contacting PBOS or completing a profile", async () => {
    mocks.requireUser.mockResolvedValue({ user: null, supabase: {} });
    expect((await POST(request())).status).toBe(401);
    expect(mocks.complete).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
