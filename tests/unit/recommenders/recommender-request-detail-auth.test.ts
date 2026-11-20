import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ requireUser: vi.fn(), from: vi.fn(), maybeSingle: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ requireUser: mocks.requireUser }));
import { GET } from "@/app/api/recommenders/[requestId]/route";

const requestId = "11111111-1111-4111-8111-111111111111";
const req = new NextRequest(`http://127.0.0.1/api/recommenders/${requestId}`);
const context = (id = requestId) => ({ params: Promise.resolve({ requestId: id }) });

beforeEach(() => {
  vi.resetAllMocks();
  mocks.from.mockImplementation(() => ({
    select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }),
  }));
  mocks.requireUser.mockResolvedValue({ user: { id: "scholar-owner" }, supabase: { from: mocks.from } });
  mocks.maybeSingle.mockResolvedValue({ data: {
    id: requestId, scholar_id: "scholar-owner", scholar_name: "Fixture Scholar",
    recommender_name: "Authorized Person", recommender_role: "coach",
    opportunity_name: "Academic Program", status: "sent", letter_text: null,
    approved_at: null, created_at: "2026-11-20T00:00:00Z",
  }, error: null });
});

describe("DYN-003 authenticated recommender request resolution", () => {
  it("refuses anonymous retrieval before querying the recommendation", async () => {
    mocks.requireUser.mockResolvedValue({ user: null, supabase: { from: mocks.from } });
    const response = await GET(req, context());
    expect(response.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("reads a real request through the normal RLS-bound Supabase client", async () => {
    const response = await GET(req, context());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    const payload = await response.json();
    expect(payload.request.scholar_name).toBe("Fixture Scholar");
    expect(payload.request.status).toBe("sent");
    expect(mocks.from).toHaveBeenCalledWith("recommender_requests");
  });

  it("hides a missing or RLS-denied request without leaking its owner", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    const response = await GET(req, context());
    expect(response.status).toBe(404);
    expect(JSON.stringify(await response.json())).not.toContain("scholar-owner");
  });

  it("rejects malformed IDs before any database query", async () => {
    const response = await GET(req, context("request-demo"));
    expect(response.status).toBe(404);
    expect(mocks.from).not.toHaveBeenCalled();
  });
});
