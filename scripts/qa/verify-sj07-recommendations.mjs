// Never operate on hosted Supabase. This is a disposable localhost release gate.
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
assert(url && /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/)/.test(url),"Refusing non-local Supabase target");
assert(anon&&service,"Missing disposable local keys");
const admin=createClient(url,service,{auth:{persistSession:false}});
const anonClient=createClient(url,anon,{auth:{persistSession:false}});

async function fixture(role) {
  const email=`sj07-${role}-${randomUUID()}@example.invalid`;
  const password=randomBytes(20).toString("hex")+"Aa1!";
  const created=await admin.auth.admin.createUser({email,password,email_confirm:true});
  assert(!created.error && created.data.user,"Synthetic auth provisioning failed: "+created.error?.message);
  const user=created.data.user;
  const profile=await admin.from("profiles").upsert({
    id:user.id,role,profile_mode:role,requested_role:role,
    verification_status:"email_confirmed",onboarding_completed:true,
    onboarding_data:{synthetic:true}
  },{onConflict:"id"});
  assert(!profile.error,"Synthetic profile failed: "+profile.error?.message);
  const session=await anonClient.auth.signInWithPassword({email,password});
  assert(!session.error&&session.data.session,"Synthetic session failed");
  const client=createClient(url,anon,{
    global:{headers:{Authorization:"Bearer "+session.data.session.access_token}},
    auth:{persistSession:false}
  });
  return {id:user.id,email,client};
}
const scholar=await fixture("scholar");
const recommender=await fixture("mentor");
const outsider=await fixture("family");
const record=await admin.from("playbook_records")
  .insert({profile_id:scholar.id,record_type:"scholar",status:"active"}).select("id").single();
assert(!record.error&&record.data?.id,"Canonical Playbook Record required");

async function requestFor(name) {
  const created=await scholar.client.from("recommender_requests").insert({
    scholar_id:scholar.id,scholar_name:"Synthetic Scholar",
    recommender_name:name,recommender_email:recommender.email,
    recommender_role:"mentor",opportunity_name:"Synthetic Internship",
    status:"draft",evidence:[]
  }).select("id").single();
  assert(!created.error&&created.data?.id,"Scholar request insert failed: "+created.error?.message);
  const sent=await scholar.client.from("recommender_requests").update({status:"sent"})
    .eq("id",created.data.id);
  assert(!sent.error,"Request delivery state transition failed: "+sent.error?.message);
  return created.data.id;
}
const openId=await requestFor("Test Mentor");
const tamper=await scholar.client.from("recommender_requests")
  .update({recommender_email:outsider.email}).eq("id",openId);
assert(tamper.error,"Scholar unexpectedly rewrote sealed recommender identity");
const directSubmitted=await scholar.client.from("recommender_requests").update({status:"submitted"}).eq("id",openId);
assert(directSubmitted.error,"Scholar forged recommendation submission status");
const forgedInsert=await scholar.client.from("recommender_requests").insert({
  scholar_id:scholar.id,scholar_name:"Synthetic Scholar",
  recommender_name:"Spoof",recommender_email:outsider.email,
  recommender_role:"mentor",opportunity_name:"Synthetic",status:"submitted",
});
assert(forgedInsert.error,"Scholar unexpectedly inserted forged submitted request");

const sample="I independently observed this Scholar serve their community with consistent leadership and ethical conduct. Their contributions were specific and meaningful.";
const denied=await outsider.client.rpc("submit_recommendation_letter",{
  p_request_id:openId,p_letter:sample,p_confidentiality:"open"
});
assert(denied.error,"Non-recipient unexpectedly submitted recommendation");
const ownerDenied=await scholar.client.rpc("submit_recommendation_letter",{
  p_request_id:openId,p_letter:sample,p_confidentiality:"open"
});
assert(ownerDenied.error,"Scholar unexpectedly self-submitted recommendation");
const submitted=await recommender.client.rpc("submit_recommendation_letter",{
  p_request_id:openId,p_letter:sample,p_confidentiality:"open"
});
assert(!submitted.error&&submitted.data,"Authorized open letter submission failed: "+submitted.error?.message);
const repeat=await recommender.client.rpc("submit_recommendation_letter",{
  p_request_id:openId,p_letter:sample,p_confidentiality:"open"
});
assert(repeat.error,"Duplicate letter submission unexpectedly succeeded");

const direct=await scholar.client.from("recommendation_letter_artifacts").select("*");
assert(direct.error,"Scholar bypassed guarded letter artifact read");
const readOpen=await scholar.client.rpc("read_open_recommendation_letter",{
  p_artifact_id:submitted.data
});
assert(!readOpen.error&&readOpen.data?.[0]?.letter_text===sample,"Owner cannot read open letter");
const outsiderRead=await outsider.client.rpc("read_open_recommendation_letter",{
  p_artifact_id:submitted.data
});
assert(!outsiderRead.error&&outsiderRead.data.length===0,"Cross-user read leaked open letter");

const confidentialId=await requestFor("Test Mentor Confidential");
const confidential=await recommender.client.rpc("submit_recommendation_letter",{
  p_request_id:confidentialId,p_letter:sample+" This confidential letter is not for Scholar access.",
  p_confidentiality:"confidential"
});
assert(!confidential.error&&confidential.data,"Confidential letter submission failed");
const hidden=await scholar.client.rpc("read_open_recommendation_letter",{
  p_artifact_id:confidential.data
});
assert(!hidden.error&&hidden.data.length===0,"Confidential recommendation leaked to Scholar");
const indexed=await scholar.client.rpc("list_submitted_recommendation_vault");
assert(!indexed.error&&indexed.data?.length===2,"Authoritative Scholar Vault index missing artifacts");
assert(indexed.data.every(x=>!('letter_text' in x)),"Vault metadata leaked recommendation text");
const noOther=await outsider.client.rpc("list_submitted_recommendation_vault");
assert(!noOther.error&&noOther.data.length===0,"Cross-user Vault list leaked artifacts");

// Fixture is provisioned by the isolated test administrator, not by the Scholar.
// This tests attachment authorization only; Scholar workspace creation remains
// a separate unresolved policy regression gate and is NOT certified here.
const workspace=await admin.from("application_workspaces").insert({
  scholar_id:scholar.id,opportunity_name:"Synthetic Internship",opportunity_type:"internship",
  status:"building",recommendation_request_ids:[]
}).select("id").single();
assert(!workspace.error&&workspace.data?.id,"Synthetic application workspace failed: "+workspace.error?.message);
const wrongAttach=await outsider.client.rpc("attach_recommendation_to_application",{
  p_workspace_id:workspace.data.id,p_request_id:openId
});
assert(wrongAttach.error,"Outsider attached recommendation to Scholar workspace");
for(const id of [openId,confidentialId,openId]){
  const attached=await scholar.client.rpc("attach_recommendation_to_application",{
    p_workspace_id:workspace.data.id,p_request_id:id
  });
  assert(!attached.error,"Owner attachment failed: "+attached.error?.message);
}
const result=await scholar.client.from("application_workspaces")
  .select("recommendation_request_ids").eq("id",workspace.data.id).single();
assert(!result.error&&result.data.recommendation_request_ids.length===2,
  "Application reference attachment must be idempotent and exclude letter content");
console.log("SJ-07 isolated recommendation identity, confidential Vault and packet reference gates PASS");
