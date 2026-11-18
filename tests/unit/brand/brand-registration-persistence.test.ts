// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(), from: vi.fn(), upsert: vi.fn(),
  profile: { role: "brand-partner", profile_mode: "brand-partner", onboarding_completed: true },
  request: { status: "pending", organization_name: "Example LLC", nil_acknowledgement: "Acknowledged" },
  details: null as Record<string, unknown> | null,
}));
vi.mock("@/lib/supabase/server", () => ({ requireUser: mocks.requireUser }));
import { GET, PATCH } from "@/app/api/brand-verification/route";

const registration = {
  formationState: "California", entityType: "LLC", entityNumber: "",
  safetyAnswers: { minors: "no", financial: "no", violence: "no" },
  safeguardingAccepted: true,
};
function input(body: unknown) {
  return new Request("http://localhost/api/brand-verification", {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.profile = { role: "brand-partner", profile_mode: "brand-partner", onboarding_completed: true };
  mocks.request = { status: "pending", organization_name: "Example LLC", nil_acknowledgement: "Acknowledged" };
  mocks.details = null;
  mocks.upsert.mockResolvedValue({ data: null, error: null });
  mocks.from.mockImplementation((table: string) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({
          data: table === "profiles" ? mocks.profile :
            table === "brand_partner_verification_requests" ? mocks.request :
            table === "brand_partner_registration_details" ? mocks.details : null,
          error: null,
        }),
      }),
    }),
    upsert: mocks.upsert,
  }));
  mocks.requireUser.mockResolvedValue({ user: { id: "operator-test" }, supabase: { from: mocks.from } });
});

describe("Brand Partner registration save independently of verification decision", () => {
  it("persists full registration under the authenticated owner without changing pending review", async () => {
    const response = await PATCH(input({ registration }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, message: expect.stringContaining("still awaiting independent review") });
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      brand_user_id: "operator-test", formation_state: "California",
      entity_type: "LLC", safety_answers: registration.safetyAnswers, safeguarding_accepted: true,
    }), { onConflict: "brand_user_id" });
    expect(mocks.from).not.toHaveBeenCalledWith("verification_communications");
    const payload = mocks.upsert.mock.calls[0][0];
    expect(payload).not.toHaveProperty("status");
    expect(payload).not.toHaveProperty("campaign_scope_approved");
    expect(payload).not.toHaveProperty("compliance_scope_approved");
  });

  it("returns a missing registration row separately from an existing pending request", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ request: expect.objectContaining({ status: "pending" }), registrationDetails: null });
  });

  it("fails closed for unauthenticated or non-Brand Partner accounts", async () => {
    mocks.requireUser.mockResolvedValueOnce({ user: null, supabase: { from: mocks.from } });
    expect((await PATCH(input({ registration }))).status).toBe(401);
    mocks.profile = { role: "family", profile_mode: "family", onboarding_completed: true };
    expect((await PATCH(input({ registration }))).status).toBe(403);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("refuses to overwrite approved verification and rejects incomplete safety details", async () => {
    mocks.request = { ...mocks.request, status: "approved" };
    expect((await PATCH(input({ registration }))).status).toBe(409);
    mocks.request = { ...mocks.request, status: "pending" };
    expect((await PATCH(input({ registration: { ...registration, formationState: "" } }))).status).toBe(422);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("does not claim save success when database upsert is rejected", async () => {
    mocks.upsert.mockResolvedValue({ data: null, error: { message: "RLS denied" } });
    const response = await PATCH(input({ registration }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("could not be saved") });
  });
});
