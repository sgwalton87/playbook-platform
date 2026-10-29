import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ requireUser: vi.fn(), rpc: vi.fn(), from: vi.fn(), role: "admin", profileError: false }));
vi.mock("@/lib/supabase/server", () => ({ requireUser: mocks.requireUser }));
import { GET } from "@/app/api/shell/context/route";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.role = "admin";
  mocks.profileError = false;
  mocks.rpc.mockResolvedValue({ data: [{ request_type: "brand-partner" }, { request_type: "coach" }], error: null });
  mocks.from.mockImplementation((table: string) => {
    const result = { data: null, count: 3, error: null };
    const query = {
      select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), is: vi.fn().mockReturnThis(),
      maybeSingle: async () => ({ data: { role: mocks.role }, error: mocks.profileError ? { message: "denied" } : null }),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve(table === "profiles" ? null : result).then(resolve),
    };
    return query;
  });
  mocks.requireUser.mockResolvedValue({ user: { id: "reviewer" }, supabase: { from: mocks.from, rpc: mocks.rpc } });
});

describe("reviewer dashboard attention counts", () => {
  it("uses the governed request queue rather than personal verifications", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ pendingVerificationCount: 2 });
    expect(mocks.rpc).toHaveBeenCalledWith("get_verification_review_queue");
    expect(mocks.from).not.toHaveBeenCalledWith("verifications");
    expect(response.headers.get("cache-control")).toBe("no-store, private");
  });
  it("preserves personal counts and does not query private role requests for ordinary users", async () => {
    mocks.role = "brand-partner";
    const response = await GET();
    expect(await response.json()).toMatchObject({ pendingVerificationCount: 3 });
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.from).toHaveBeenCalledWith("verifications");
  });
  it("does not report an empty queue when reviewer access fails", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "Reviewer authority unavailable" } });
    expect((await GET()).status).toBe(500);
  });
  it("fails closed when stored role cannot be read", async () => {
    mocks.profileError = true;
    expect((await GET()).status).toBe(500);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});
