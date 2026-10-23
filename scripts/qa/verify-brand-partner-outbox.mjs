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

const { randomUUID, randomBytes } = await import('node:crypto');
const fixtures = [];
async function newUser(role) {
  const email = `qa-${role}-${randomUUID()}@example.invalid`;
  const password = randomBytes(18).toString('hex')+'Aa!';
  const created = await admin.auth.admin.createUser({email,password,email_confirm:true});
  assert(!created.error && created.data.user, 'Synthetic auth account creation failed');
  fixtures.push(created.data.user.id);
  const profile = await admin.from('profiles').upsert({
    id:created.data.user.id,role,profile_mode:role,requested_role:role,
    onboarding_completed:true, verification_status:'email_confirmed',onboarding_data:{synthetic:true}
  },{onConflict:'id'});
  assert(!profile.error, 'Synthetic profile fixture failed: '+profile.error?.message);
  const signed = await createClient(url,anon,{auth:{persistSession:false}}).auth.signInWithPassword({email,password});
  assert(!signed.error && signed.data.session, 'Synthetic account login failed');
  const client = createClient(url,anon,{global:{headers:{Authorization:'Bearer '+signed.data.session.access_token}},auth:{persistSession:false}});
  return {id:created.data.user.id,client};
}
try {
  const partner=await newUser('brand-partner');
  const reviewer=await newUser('mentor');
  const insert=await partner.client.from('brand_partner_verification_requests').insert({
    brand_user_id:partner.id,organization_name:'Synthetic QA Organization',
    nil_acknowledgement:'Synthetic QA only',status:'pending'
  }).select('id').single();
  assert(!insert.error && insert.data?.id,'Partner submission failed: '+insert.error?.message);
  const requestId=insert.data.id;
  const job=await admin.from('brand_partner_notification_outbox').select('*').eq('request_id',requestId).single();
  assert(!job.error && job.data?.status==='pending','Atomic notification enqueue missing');
  const unauthReview=await partner.client.rpc('decide_brand_partner_review',{p_request_id:requestId,p_scope:'organization',p_decision:'approve',p_reason:'Synthetic reviewed'});
  assert(unauthReview.error,'Unprivileged applicant was able to approve');
  const noGrant=await reviewer.client.rpc('list_brand_partner_review_queue');
  assert(noGrant.error,'Unprivileged reviewer saw queue');
  const grant=await admin.from('brand_partner_reviewer_grants').insert({reviewer_id:reviewer.id,review_scope:'organization',grant_reason:'Disposable QA only'});
  assert(!grant.error,'Test grant failed: '+grant.error?.message);
  const reviewerQueue=await reviewer.client.rpc('list_brand_partner_review_queue');
  assert(!reviewerQueue.error && reviewerQueue.data.some(r=>r.request_id===requestId),'Scoped reviewer cannot view queue');
  const premature=await reviewer.client.rpc('decide_brand_partner_review',{p_request_id:requestId,p_scope:'campaign',p_decision:'approve',p_reason:'Synthetic check'});
  assert(premature.error,'Organization-only reviewer acquired campaign scope');
  const approve=await reviewer.client.rpc('decide_brand_partner_review',{p_request_id:requestId,p_scope:'organization',p_decision:'approve',p_reason:'Synthetic verification passed'});
  assert(!approve.error,'Organization review failed: '+approve.error?.message);
  const state=await admin.from('brand_partner_verification_requests').select('status,campaign_scope_approved,compliance_scope_approved').eq('id',requestId).single();
  assert(!state.error && state.data.status==='approved' && !state.data.campaign_scope_approved && !state.data.compliance_scope_approved,'Scope escalation detected');
  const audit=await admin.from('brand_partner_review_audit').select('id').eq('request_id',requestId);
  assert(!audit.error && audit.data.length===1,'Decision audit missing');
  // Scope escalation is explicit and independently audited.
  const campaignGrant=await admin.from('brand_partner_reviewer_grants').insert({reviewer_id:reviewer.id,review_scope:'campaign',grant_reason:'Disposable campaign QA'});
  assert(!campaignGrant.error,'Synthetic campaign grant failed');
  const campaignDecision=await reviewer.client.rpc('decide_brand_partner_review',{p_request_id:requestId,p_scope:'campaign',p_decision:'approve',p_reason:'Synthetic campaign review'});
  assert(!campaignDecision.error,'Authorized campaign review failed: '+campaignDecision.error?.message);
  const campaignState=await admin.from('brand_partner_verification_requests').select('campaign_scope_approved,compliance_scope_approved').eq('id',requestId).single();
  assert(campaignState.data?.campaign_scope_approved && !campaignState.data?.compliance_scope_approved,'Campaign approval improperly granted compliance scope');
  const complianceDenied=await reviewer.client.rpc('decide_brand_partner_review',{p_request_id:requestId,p_scope:'compliance',p_decision:'approve',p_reason:'Synthetic compliance review'});
  assert(complianceDenied.error,'Campaign reviewer unexpectedly approved compliance scope');
  const complianceGrant=await admin.from('brand_partner_reviewer_grants').insert({reviewer_id:reviewer.id,review_scope:'compliance',grant_reason:'Disposable compliance QA'});
  assert(!complianceGrant.error,'Synthetic compliance grant failed');
  const complianceDecision=await reviewer.client.rpc('decide_brand_partner_review',{p_request_id:requestId,p_scope:'compliance',p_decision:'approve',p_reason:'Synthetic compliance accepted'});
  assert(!complianceDecision.error,'Authorized compliance review failed: '+complianceDecision.error?.message);
  const fullyApproved=await admin.from('brand_partner_verification_requests').select('status,campaign_scope_approved,compliance_scope_approved').eq('id',requestId).single();
  assert(fullyApproved.data?.status==='approved' && fullyApproved.data?.campaign_scope_approved && fullyApproved.data?.compliance_scope_approved,'Full authorized approval sequence failed');
  const reviewerAudit=await admin.from('brand_partner_review_audit').select('review_scope').eq('request_id',requestId);
  assert(!reviewerAudit.error && reviewerAudit.data?.length===3,'Expected three separate scope audit events');
  const revoke=await admin.from('brand_partner_reviewer_grants').update({active:false,revoked_at:new Date().toISOString()}).eq('reviewer_id',reviewer.id).eq('review_scope','compliance');
  assert(!revoke.error,'Could not revoke synthetic reviewer compliance grant');
  const afterRevoke=await reviewer.client.rpc('decide_brand_partner_review',{p_request_id:requestId,p_scope:'compliance',p_decision:'approve',p_reason:'Revoked reviewer should fail'});
  assert(afterRevoke.error,'Revoked reviewer retained compliance approval authority');
  console.log('Synthetic organization, campaign, compliance and revocation boundaries PASS');
  const claim1=await admin.rpc('claim_brand_partner_notification');
  assert(!claim1.error && claim1.data?.[0]?.request_id===requestId,'Worker could not claim queued notification');
  const attempt=claim1.data[0].attempt_count;
  const failed=await admin.rpc('finish_brand_partner_notification',{p_request_id:requestId,p_attempt_count:attempt,p_sent:false,p_error:'synthetic SMTP unavailable'});
  assert(!failed.error,'Failure acknowledgement failed');
  const afterFailure=await admin.from('brand_partner_notification_outbox').select('status,attempt_count,next_attempt_at').eq('request_id',requestId).single();
  assert(!afterFailure.error && afterFailure.data.status==='failed' && afterFailure.data.attempt_count===attempt,'Delivery failure was not persisted');
  const noImmediateRetry=await admin.rpc('claim_brand_partner_notification');
  assert(!noImmediateRetry.error && !noImmediateRetry.data.some(r=>r.request_id===requestId),'Retry ignored cooldown');
  const advance=await admin.from('brand_partner_notification_outbox').update({next_attempt_at:new Date(Date.now()-1000).toISOString()}).eq('request_id',requestId);
  assert(!advance.error,'Could not advance disposable retry clock');
  const claim2=await admin.rpc('claim_brand_partner_notification');
  assert(!claim2.error && claim2.data?.[0]?.request_id===requestId && claim2.data[0].attempt_count===attempt+1,'Retry claim failed');
  const stale=await admin.rpc('finish_brand_partner_notification',{p_request_id:requestId,p_attempt_count:attempt,p_sent:true,p_error:null});
  assert(!stale.error,'Stale ack RPC failed');
  const beforeFinish=await admin.from('brand_partner_notification_outbox').select('status').eq('request_id',requestId).single();
  assert(beforeFinish.data.status==='sending','Stale worker overwrote current attempt');
  const delivered=await admin.rpc('finish_brand_partner_notification',{p_request_id:requestId,p_attempt_count:attempt+1,p_sent:true,p_error:null});
  assert(!delivered.error,'Delivery recovery acknowledgement failed');
  const finalRow=await admin.from('brand_partner_notification_outbox').select('status,sent_at').eq('request_id',requestId).single();
  assert(finalRow.data.status==='sent' && finalRow.data.sent_at,'Recovered notification not marked delivered');
  console.log('Synthetic Brand Partner submit, reviewer scope, audit and delivery failure/retry PASS');
} finally {
  // The decision-audit reviewer FK intentionally preserves audit history in production.
  // Remove synthetic records explicitly before deleting disposable auth users.
  const auditCleanup = await admin.from('brand_partner_review_audit').delete().in('reviewer_id', fixtures);
  if (auditCleanup.error) throw new Error('Synthetic audit cleanup failed: '+auditCleanup.error.message);
  const requestCleanup = await admin.from('brand_partner_verification_requests').delete().in('brand_user_id', fixtures);
  if (requestCleanup.error) throw new Error('Synthetic request cleanup failed: '+requestCleanup.error.message);
  const grantCleanup = await admin.from('brand_partner_reviewer_grants').delete().in('reviewer_id', fixtures);
  if (grantCleanup.error) throw new Error('Synthetic grant cleanup failed: '+grantCleanup.error.message);
  for(const id of fixtures.reverse()) {
    const deleted=await admin.auth.admin.deleteUser(id);
    if(deleted.error) throw new Error('Synthetic user cleanup failed: '+deleted.error.message);
  }
}
