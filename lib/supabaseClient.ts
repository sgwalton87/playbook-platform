import { createBrowserClient } from "@supabase/ssr";
import { rememberMeCookieMethods } from "@/lib/auth/rememberMe";
import { PLAYBOOK_PKCE_AUTH_OPTIONS } from "@/lib/auth/pkce";
import { getPlaybookPublicSupabaseConfig } from "@/lib/supabase/publicConfig";

const { url: supabaseUrl, publishableKey: supabaseAnonKey, usingCanonicalFallback } =
  getPlaybookPublicSupabaseConfig();

if (usingCanonicalFallback) {
  console.warn(
    "Playbook Supabase public environment variables are missing; using the canonical Playbook OS public project configuration."
  );
}

const browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: rememberMeCookieMethods,
  auth: PLAYBOOK_PKCE_AUTH_OPTIONS,
});

type BrowserClient = typeof browserClient;
type RuntimeRpcResponse<T> = {
  data: T | null;
  error: { message: string } | null;
  count: number | null;
  status: number;
  statusText: string;
};
type RuntimeRpcBuilder<T> = PromiseLike<RuntimeRpcResponse<T[]>> & {
  maybeSingle: () => PromiseLike<RuntimeRpcResponse<T>>;
  single: () => PromiseLike<RuntimeRpcResponse<T>>;
};
type RuntimeCertifiedRpcClient = Omit<BrowserClient, "rpc"> & {
  /**
   * The browser client is not generated from database function types yet.
   * Preserve the native RPC signature while adding a narrow runtime-certified
   * overload for repository SQL functions. The default result stays on the
   * existing LegacyValue compatibility boundary instead of widening to `any`.
   */
  rpc: (<T = LegacyValue>(
    fn: string,
    args?: Record<string, unknown>
  ) => RuntimeRpcBuilder<T>) & BrowserClient["rpc"];
};

export const supabase = browserClient as RuntimeCertifiedRpcClient;
