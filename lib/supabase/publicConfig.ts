const PLAYBOOK_SUPABASE_URL = "https://oexgxnybeixwadgtdtzp.supabase.co";
const PLAYBOOK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9T3jZbZ_BNUMhkA2jeqxpA__UUAEOue";

export function getPlaybookPublicSupabaseConfig() {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const configuredKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = configuredUrl || PLAYBOOK_SUPABASE_URL;
  const publishableKey = configuredKey || PLAYBOOK_SUPABASE_PUBLISHABLE_KEY;

  if (url.includes("placeholder.supabase.co") || publishableKey === "placeholder-anon-key") {
    throw new Error("Invalid Playbook Supabase configuration: placeholder credentials are prohibited.");
  }

  return {
    url,
    publishableKey,
    usingCanonicalFallback: !configuredUrl || !configuredKey,
  } as const;
}
