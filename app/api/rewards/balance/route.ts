import { NextRequest,NextResponse } from "next/server";
import { calculateRewardBalance } from "@/lib/reward-events";
import { resolveServerAuthorization } from "@/lib/authorization/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function GET(req:NextRequest){const scholarId=req.nextUrl.searchParams.get("scholarId");if(!scholarId)return NextResponse.json({error:"Missing scholarId"},{status:400});const access=await resolveServerAuthorization({scholarId,permission:"view_progress"});if(!access.authorized)return NextResponse.json({error:"Authorized Scholar context required."},{status:403});const supabase=await createServerSupabaseClient();const {data,error}=await supabase.from("coin_ledger").select("*").eq("scholar_id",access.scholarId).order("created_at",{ascending:false});return error?NextResponse.json({error:error.message},{status:400}):NextResponse.json({entries:data||[],balance:calculateRewardBalance(data||[])});}
