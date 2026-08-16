import { createBrowserClient } from "@supabase/ssr";
import { rememberMeCookieMethods } from "@/lib/auth/rememberMe";
import { PLAYBOOK_PKCE_AUTH_OPTIONS } from "@/lib/auth/pkce";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Supabase client will use build-safe placeholder values."
  );
}

const browserClient = createBrowserClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    cookies: rememberMeCookieMethods,
    auth: PLAYBOOK_PKCE_AUTH_OPTIONS,
  }
);

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
