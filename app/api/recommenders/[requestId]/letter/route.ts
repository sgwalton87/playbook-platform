import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";

type Context = { params: Promise<{ requestId: string }> };
function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET(_request: NextRequest, context: Context) {
  const {requestId}=await context.params;
  if(!isUuid(requestId)) return NextResponse.json({error:"Invalid request."},{status:400});
  const {supabase,user}=await requireUser();
  if(!user) return NextResponse.json({error:"Sign in to continue."},{status:401});
  // Recommender email-bound SELECT is RLS-protected. No service-role bypass.
  const {data,error}=await supabase.from("recommender_requests")
    .select("id,scholar_name,recommender_name,recommender_email,opportunity_name,status")
    .eq("id",requestId).maybeSingle();
  if(error) return NextResponse.json({error:"Unable to open request."},{status:503});
  if(!data || data.recommender_email.toLowerCase()!==user.email?.toLowerCase() ||
     user.email_confirmed_at == null) {
    return NextResponse.json({error:"A verified invited recommender account is required."},{status:403});
  }
  return NextResponse.json({request:{
    id:data.id, scholarName:data.scholar_name, opportunityName:data.opportunity_name,
    recommenderName:data.recommender_name,status:data.status
  }});
}

export async function POST(request: NextRequest, context: Context) {
  const {requestId}=await context.params;
  if(!isUuid(requestId)) return NextResponse.json({error:"Invalid request."},{status:400});
  const {supabase,user}=await requireUser();
  if(!user) return NextResponse.json({error:"Sign in to continue."},{status:401});
  if(user.email_confirmed_at == null) return NextResponse.json({error:"Email verification required."},{status:403});
  let body: {letter?:unknown;confidentiality?:unknown};
  try {body=await request.json();}catch{return NextResponse.json({error:"Invalid submission."},{status:400});}
  if(typeof body.letter!=="string" || body.letter.trim().length<100 || body.letter.trim().length>20000 ||
    (body.confidentiality!=="open" && body.confidentiality!=="confidential")) {
    return NextResponse.json({error:"Provide a 100–20,000 character letter and choose confidentiality."},{status:400});
  }
  const {data,error}=await supabase.rpc("submit_recommendation_letter",{
    p_request_id:requestId,p_letter:body.letter.trim(),p_confidentiality:body.confidentiality,
  });
  if(error) return NextResponse.json({error:"Submission was not authorized or could not be completed."},{status:403});
  return NextResponse.json({ok:true,artifactId:data,status:"submitted"},{status:201});
}
