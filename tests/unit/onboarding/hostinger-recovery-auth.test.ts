// @vitest-environment node
import type { BrowserContext } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signInLocalRecoveryBrowser } from "@/tests/acceptance/helpers/signInLocalRecoveryBrowser";

vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

const environment = {
  PBOS_ALLOW_SYNTHETIC_AUTH_WRITE: "YES",
  PLAYWRIGHT_BASE_URL: "http://127.0.0.1:4319",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "disposable-public-key",
};
const credentials = { email: "scholar@example.invalid", password: "disposable-password" };

function browser() {
  const context = { route: vi.fn(), addCookies: vi.fn() };
  return { context, browserContext: context as unknown as BrowserContext };
}

describe("Hostinger localhost session setup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a hosted API before modifying the browser or constructing a client", async () => {
    const { context, browserContext } = browser();
    await expect(signInLocalRecoveryBrowser(browserContext, credentials, {
      ...environment, NEXT_PUBLIC_SUPABASE_URL: "https://hosted.example.invalid",
    })).rejects.toThrow(/localhost/);
    expect(createServerClient).not.toHaveBeenCalled();
    expect(context.route).not.toHaveBeenCalled();
  });

  it("uses cookies written by local Auth and blocks external browser requests", async () => {
    const { context, browserContext } = browser();
    vi.mocked(createServerClient).mockImplementation((url, key, options) => {
      expect(url).toBe(environment.NEXT_PUBLIC_SUPABASE_URL);
      expect(key).toBe(environment.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const signInWithPassword = vi.fn(async (input) => {
        expect(input).toEqual(credentials);
        options.cookies.setAll?.([{ name: "sb-local-auth-token", value: "fixture-session", options: {} }], {});
        expect(() => options.global!.fetch!("https://hcaptcha.com/")).toThrow(/leave localhost/);
        return { data: { session: {} }, error: null };
      });
      return { auth: { signInWithPassword } } as unknown as ReturnType<typeof createServerClient>;
    });

    await signInLocalRecoveryBrowser(browserContext, credentials, environment);
    expect(context.addCookies).toHaveBeenCalledWith([{
      name: "sb-local-auth-token", value: "fixture-session", url: environment.PLAYWRIGHT_BASE_URL, sameSite: "Lax",
    }]);
    const guard = context.route.mock.calls[0][1];
    const abort = vi.fn();
    const proceed = vi.fn();
    await guard({ request: () => ({ url: () => "https://js.hcaptcha.com/1/api.js" }), abort, continue: proceed });
    expect(abort).toHaveBeenCalledWith("blockedbyclient");
    expect(proceed).not.toHaveBeenCalled();
    await guard({ request: () => ({ url: () => environment.PLAYWRIGHT_BASE_URL + "/check-email" }), abort, continue: proceed });
    expect(proceed).toHaveBeenCalledTimes(1);
  });
});
