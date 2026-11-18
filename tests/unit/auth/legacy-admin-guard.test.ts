import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  profile: { role: "scholar_athlete", is_admin: true, is_active: true },
  profileError: null as { message: string } | null,
}));

vi.mock("@/lib/supabase/server", () => ({ requireUser: mocks.requireUser }));
import { requirePlatformOperator } from "@/lib/auth/requirePlatformOperator";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.profile = { role: "scholar_athlete", is_admin: true, is_active: true };
  mocks.profileError = null;
  mocks.requireUser.mockImplementation(async () => ({
    user: { id: "existing-founder" },
    supabase: {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: mocks.profile, error: mocks.profileError }),
          }),
        }),
      }),
    },
  }));
});

describe("controlled platform operator role convergence", () => {
  it("honors the protected active admin designation without overwriting learner role", async () => {
    expect(await requirePlatformOperator()).toEqual({ authorized: true, authenticated: true });
  });

  it("denies ordinary learner profiles", async () => {
    mocks.profile = { role: "scholar_athlete", is_admin: false, is_active: true };
    expect(await requirePlatformOperator()).toEqual({ authorized: false, authenticated: true });
  });

  it("denies inactive flagged accounts", async () => {
    mocks.profile = { role: "scholar_athlete", is_admin: true, is_active: false };
    expect(await requirePlatformOperator()).toEqual({ authorized: false, authenticated: true });
  });

  it("preserves canonical founder role authorization", async () => {
    mocks.profile = { role: "founder", is_admin: false, is_active: true };
    expect(await requirePlatformOperator()).toEqual({ authorized: true, authenticated: true });
  });

  it("fails closed on profile read errors", async () => {
    mocks.profileError = { message: "permission denied" };
    expect(await requirePlatformOperator()).toEqual({ authorized: false, authenticated: true });
  });

  it("denies unauthenticated requests", async () => {
    mocks.requireUser.mockResolvedValue({ user: null, supabase: {} });
    expect(await requirePlatformOperator()).toEqual({ authorized: false, authenticated: false });
  });
});
