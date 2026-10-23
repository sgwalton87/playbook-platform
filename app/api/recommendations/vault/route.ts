import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { requireLearnerAuthority } from "@/lib/auth/learner-authority";

export async function GET() {
  try {
    const {supabase,user}=await requireUser();
    if(!user)return NextResponse.json({error:"Authentication required"},{status:401});
    await requireLearnerAuthority(supabase,user.id,{requireOnboarding:true});
    const records=await supabase.from("playbook_records").select("id").eq("profile_id",user.id).is("deleted_at",null);
    if(records.error)throw new Error(records.error.message);
    const recordIds=(records.data??[]).map(x=>x.id);
    if(recordIds.length===0)return NextResponse.json({letters:[],workspaces:[]});
    const [vault,workspaces]=await Promise.all([
      supabase.from("scholar_vault_items").select("id,title,metadata,created_at")
        .in("record_id",recordIds).eq("item_type","recommendation").is("deleted_at",null)
        .order("created_at",{ascending:false}),
      supabase.from("application_workspaces").select("id,opportunity_name,status,recommendation_request_ids")
        .eq("scholar_id",user.id).order("created_at",{ascending:false}).limit(50)
    ]);
    if(vault.error||workspaces.error)throw new Error(vault.error?.message??workspaces.error?.message);
    const letters=(vault.data??[]).filter(item=>{
      const metadata=item.metadata as Record<string,unknown>|null;
      return metadata?.folder==="Applications & Career / Recommendations" && metadata?.status==="submitted";
    }).map(item=>{
      const m=item.metadata as Record<string,unknown>;
      return {vaultId:item.id,title:item.title,requestId:m.request_id,artifactId:m.artifact_id,
        confidentiality:m.confidentiality,createdAt:item.created_at};
    });
    return NextResponse.json({letters,workspaces:workspaces.data??[]});
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
