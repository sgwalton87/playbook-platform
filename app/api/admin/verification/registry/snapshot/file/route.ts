import { NextRequest,NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { UUID } from "@/lib/brand-verification/documents";
export async function GET(request:NextRequest){
 const {supabase,user}=await requireUser();
 if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const requestId=request.nextUrl.searchParams.get("requestId")??"";
 const id=request.nextUrl.searchParams.get("id")??"";
 if(!UUID.test(requestId)||!UUID.test(id))return NextResponse.json({error:"Valid IDs required."},{status:400});
 const context=await supabase.rpc("get_brand_review_context",{requested_id:requestId});
 if(context.error||!context.data)return NextResponse.json({error:"Reviewer authority or request unavailable."},{status:context.error?.code==="42501"?403:404});
 const row=await supabase.from("brand_registry_review_snapshots").select("storage_path").eq("id",id).eq("request_id",requestId).maybeSingle();
 if(row.error||!row.data)return NextResponse.json({error:"Snapshot not available."},{status:404});
 const result=await supabase.storage.from("brand-registry-review-evidence").download(row.data.storage_path);
 if(result.error||!result.data)return NextResponse.json({error:"Private screenshot unavailable."},{status:503});
 const type=row.data.storage_path.endsWith(".jpg")?"image/jpeg":"image/png";
 return new NextResponse(result.data,{headers:{"Content-Type":type,"Content-Disposition":"inline; filename=\"registry-review-evidence\"","Cache-Control":"no-store, private","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","Content-Security-Policy":"default-src 'none'; frame-ancestors 'self'; sandbox"}});
}
