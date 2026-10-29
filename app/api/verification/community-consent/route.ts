import {NextRequest,NextResponse} from "next/server";
import {requireUser} from "@/lib/supabase/server";
import {COMMUNITY_POLICY_VERSION} from "@/lib/trust/communityStandards";
export async function GET(){
 const {supabase,user}=await requireUser();if(!user)return NextResponse.json({error:"Sign in to review the community agreement."},{status:401});
 const result=await supabase.from("verification_community_consents").select("accepted_at").eq("user_id",user.id).eq("policy_version",COMMUNITY_POLICY_VERSION).maybeSingle();
 if(result.error)return NextResponse.json({error:"Agreement status unavailable."},{status:503});
 return NextResponse.json({accepted:Boolean(result.data),version:COMMUNITY_POLICY_VERSION,acceptedAt:result.data?.accepted_at??null},{headers:{"Cache-Control":"no-store, private"}});
}
export async function POST(request:NextRequest){
 const {supabase,user}=await requireUser();if(!user)return NextResponse.json({error:"Sign in to acknowledge the community agreement."},{status:401});
 const body=await request.json().catch(()=>null) as {version?:unknown;acknowledged?:unknown}|null;
 if(body?.version!==COMMUNITY_POLICY_VERSION||body?.acknowledged!==true)return NextResponse.json({error:"An explicit acknowledgement of the current community standards is required."},{status:400});
 const saved=await supabase.rpc("accept_verification_community_policy",{requested_version:COMMUNITY_POLICY_VERSION});
 if(saved.error)return NextResponse.json({error:"Agreement could not be recorded."},{status:403});
 return NextResponse.json({accepted:true,version:COMMUNITY_POLICY_VERSION,acceptedAt:saved.data},{headers:{"Cache-Control":"no-store, private"}});
}
