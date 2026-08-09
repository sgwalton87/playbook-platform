import { describe, expect, it, vi } from "vitest";
import { logout, type LogoutClient } from "@/lib/auth/logout";

describe("logout", () => {
  it("revokes all refresh sessions for the authenticated identity", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });

    await expect(logout({ auth: { signOut } })).resolves.toEqual({ ok: true });
    expect(signOut).toHaveBeenCalledWith({ scope: "global" });
  });

  it("returns a recoverable, non-sensitive error when revocation fails", async () => {
    const client: LogoutClient = {
      auth: {
        signOut: vi.fn().mockResolvedValue({ error: { message: "provider detail" } }),
      },
    };

    await expect(logout(client)).resolves.toEqual({
      ok: false,
      message: "We couldn't sign you out. Check your connection and try again.",
    });
  });
});
