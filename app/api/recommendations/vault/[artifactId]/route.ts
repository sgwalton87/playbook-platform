import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { requireLearnerAuthority } from "@/lib/auth/learner-authority";

export async function GET(_req:NextRequest,context:{params:Promise<{artifactId:string}>}) {
  const {artifactId}=await context.params;
  if(!/^[0-9a-f-]{36}$/i.test(artifactId))return NextResponse.json({error:"Invalid letter."},{status:400});
  const {supabase,user}=await requireUser();
  if(!user)return NextResponse.json({error:"Authentication required."},{status:401});
  try{await requireLearnerAuthority(supabase,user.id,{requireOnboarding:true});}
  catch{return NextResponse.json({error:"Learner access required."},{status:403});}
  const {data,error}=await supabase.rpc("read_open_recommendation_letter",{p_artifact_id:artifactId});
  if(error)return NextResponse.json({error:"Unable to open letter."},{status:503});
  const letter=Array.isArray(data)?data[0]:null;
  if(!letter)return NextResponse.json({error:"Letter is confidential or unavailable."},{status:403});
  return NextResponse.json({letter},{headers:{"Cache-Control":"private, no-store"}});
}
