// Only accepts disposable local Supabase. Never use against a hosted project.
import { createClient } from '@supabase/supabase-js';
import assert from 'node:assert/strict';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert(url && /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(url), 'Local Supabase URL required');
assert(anon && service, 'Disposable local anon and service keys required');

const user = createClient(url, anon, { auth: { persistSession: false } });
const admin = createClient(url, service, { auth: { persistSession: false } });
for (const table of ['brand_partner_notification_outbox','brand_partner_reviewer_grants','brand_partner_review_audit']) {
  const privileged = await admin.from(table).select('*', { count: 'exact', head: true });
  assert(!privileged.error, 'Service role must see migrated '+table+': '+privileged.error?.message);
  const anonymous = await user.from(table).select('*', { count: 'exact', head: true });
  assert(anonymous.error, 'Anonymous role unexpectedly read '+table);
}
for (const rpc of ['claim_brand_partner_notification','list_brand_partner_review_queue']) {
  const result = await user.rpc(rpc);
  assert(result.error, 'Anonymous role unexpectedly executed '+rpc);
}
const result = await user.rpc('finish_brand_partner_notification', {p_request_id:'00000000-0000-4000-8000-000000000001',p_attempt_count:1,p_sent:true,p_error:null});
assert(result.error, 'Anonymous role unexpectedly finished a notification');
console.log('Isolated Brand Partner outbox tables and anonymous access boundaries PASS');
