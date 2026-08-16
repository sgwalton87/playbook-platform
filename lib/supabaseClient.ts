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
type RuntimeCertifiedRpcClient = Omit<BrowserClient, "rpc"> & {
  /**
   * Browser RPC signatures are runtime-certified by the repository SQL
   * preflights until generated Supabase function types are adopted. Table/query
   * typing remains unchanged; only the RPC result boundary is intentionally
   * dynamic.
   */
  rpc: (fn: string, args?: Record<string, unknown>) => any;
};

export const supabase = browserClient as RuntimeCertifiedRpcClient;
