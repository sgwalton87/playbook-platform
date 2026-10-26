import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { requireLearnerAuthority } from "@/lib/auth/learner-authority";

export async function GET() {
  try {
    const {supabase,user}=await requireUser();
    if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
    await requireLearnerAuthority(supabase,user.id,{requireOnboarding:true});
    const [vault,workspaces]=await Promise.all([
      supabase.rpc("list_submitted_recommendation_vault"),
      supabase.from("application_workspaces").select("id,opportunity_name,status,recommendation_request_ids")
        .eq("scholar_id",user.id).order("created_at",{ascending:false}).limit(50)
    ]);
    if(vault.error)throw new Error(vault.error.message);
    // Letter metadata must remain available when legacy application workspace
    // authorization is unavailable. Never weaken RLS or expose workspace data.
    const workspaceUnavailable=Boolean(workspaces.error);
    const letters=(vault.data??[]).map((item: {vault_id:string;title:string;request_id:string;artifact_id:string;confidentiality:string;submitted_at:string})=>({
      vaultId:item.vault_id,title:item.title,requestId:item.request_id,
      artifactId:item.artifact_id,confidentiality:item.confidentiality,createdAt:item.submitted_at
    }));
    return NextResponse.json({letters,workspaces:workspaceUnavailable?[]:(workspaces.data??[]),workspaceUnavailable},{headers:{"Cache-Control":"private, no-store"}});
  }catch{
    return NextResponse.json({error:"Unable to read Scholar recommendation Vault."},{status:503});
  }
}

export async function POST(req:NextRequest){
  try{
    const {supabase,user}=await requireUser();
    if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
    await requireLearnerAuthority(supabase,user.id,{requireOnboarding:true});
    const body=await req.json() as {workspaceId?:unknown;requestId?:unknown};
    if(typeof body.workspaceId!=="string"||typeof body.requestId!=="string")
      return NextResponse.json({error:"A workspace and submitted recommendation are required."},{status:400});
    const {error}=await supabase.rpc("attach_recommendation_to_application",{
      p_workspace_id:body.workspaceId,p_request_id:body.requestId
    });
    if(error)return NextResponse.json({error:"Unauthorized or incomplete recommendation attachment."},{status:403});
    return NextResponse.json({ok:true,attachment:"request-reference-only"});
  }catch{
    return NextResponse.json({error:"Unable to attach recommendation."},{status:503});
  }
}
