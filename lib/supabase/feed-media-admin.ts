import { createClient } from "@supabase/supabase-js";

type FeedMediaBucket = "photos" | "feed-videos";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Feed media cleanup configuration is unavailable.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function removeOwnedFeedMedia(bucket: FeedMediaBucket, path: string, ownerId: string) {
  if (!path.startsWith(`${ownerId}/feed/`)) {
    throw new Error("Feed media cleanup refused a path outside the authenticated owner's Feed namespace.");
  }

  const result = await getSupabaseAdmin().storage.from(bucket).remove([path]);
  if (result.error) throw new Error(result.error.message);
}
