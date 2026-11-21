import type { BrowserContext } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { assertLocalSyntheticAuthTarget } from "./assertLocalSyntheticAuthTarget.mjs";

export async function signInLocalRecoveryBrowser(
  context: BrowserContext,
  credentials: { email: string; password: string },
  environment: Record<string, string | undefined> = process.env,
): Promise<void> {
  assertLocalSyntheticAuthTarget(environment);
  const application = new URL(environment.PLAYWRIGHT_BASE_URL!);
  const database = new URL(environment.NEXT_PUBLIC_SUPABASE_URL!);
  const publicKey = environment.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!publicKey || !credentials.email.endsWith("@example.invalid")) {
    throw new Error("Local browser sign-in requires a disposable identity and local public key.");
  }

  const allowedOrigins = new Set([application.origin, database.origin]);
  await context.route(/^https?:\/\//, (route) => {
    const origin = new URL(route.request().url()).origin;
    return allowedOrigins.has(origin) ? route.continue() : route.abort("blockedbyclient");
  });

  const cookies = new Map<string, string>();
  const client = createServerClient(database.origin, publicKey, {
    cookies: {
      getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
      setAll: updates => updates.forEach(({ name, value }) => {
        if (value) cookies.set(name, value);
        else cookies.delete(name);
      }),
    },
    global: {
      fetch: (input, init) => {
        const url = new URL(input instanceof Request ? input.url : input);
        if (url.origin !== database.origin) throw new Error("Recovery authentication attempted to leave localhost.");
        return fetch(input, { ...init, redirect: "error" });
      },
    },
  });
  const { data, error } = await client.auth.signInWithPassword(credentials);
  if (error || !data.session || cookies.size === 0) {
    throw new Error("The local Auth service did not establish the disposable browser session.");
  }
  await context.addCookies([...cookies].map(([name, value]) => ({
    name, value, url: application.origin, sameSite: "Lax" as const,
  })));
}
