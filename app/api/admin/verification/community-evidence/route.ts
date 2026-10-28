import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
const BUCKET="community-verification-evidence";
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export async function GET(req:NextRequest){
 const {supabase,user}=await requireUser();
 if(!user)return NextResponse.json({error:"Sign in required."},{status:401});
 const requestId=req.nextUrl.searchParams.get("requestId")||"";
 if(!UUID.test(requestId))return NextResponse.json({error:"Invalid request ID."},{status:400});
 const queue=await supabase.rpc("get_verification_review_queue");
 if(queue.error)return NextResponse.json({error:"Reviewer authority required."},{status:403});
 const item=((queue.data??[]) as {request_type:string;request_id:string;subject_user_id:string}[])
 .find(x=>x.request_type==="community-partner"&&x.request_id===requestId);
 if(!item)return NextResponse.json({error:"Review request not available."},{status:404});
 const listing=await supabase.storage.from(BUCKET).list(item.subject_user_id,{limit:100});
 if(listing.error)return NextResponse.json({error:"Evidence could not be accessed."},{status:503});
 const documents=[];
 for(const file of listing.data??[]){
  if(!/^organization-[a-f0-9-]+\.(pdf|png|jpg|webp)$/.test(file.name))continue;
  const signed=await supabase.storage.from(BUCKET).createSignedUrl(`${item.subject_user_id}/${file.name}`,300);
  if(signed.error||!signed.data?.signedUrl)continue;
  documents.push({name:file.name,url:signed.data.signedUrl});
 }
 return NextResponse.json({documents},{headers:{"Cache-Control":"no-store, private"}});
}
