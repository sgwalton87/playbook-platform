import { createBrowserClient } from "@supabase/ssr";
import { rememberMeCookieMethods } from "@/lib/auth/rememberMe";
import { PLAYBOOK_PKCE_AUTH_OPTIONS } from "@/lib/auth/pkce";

const PLAYBOOK_SUPABASE_URL = "https://oexgxnybeixwadgtdtzp.supabase.co";
const PLAYBOOK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9T3jZbZ_BNUMhkA2jeqxpA__UUAEOue";

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = configuredUrl || PLAYBOOK_SUPABASE_URL;
const supabaseAnonKey = configuredKey || PLAYBOOK_SUPABASE_PUBLISHABLE_KEY;

if (!configuredUrl || !configuredKey) {
  console.warn(
    "Playbook Supabase public environment variables are missing; using the canonical Playbook OS public project configuration."
  );
}

if (supabaseUrl.includes("placeholder.supabase.co") || supabaseAnonKey === "placeholder-anon-key") {
  throw new Error("Invalid Playbook Supabase configuration: placeholder credentials are prohibited.");
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
