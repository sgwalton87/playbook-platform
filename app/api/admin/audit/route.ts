import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function GET() { const supabase=await createServerSupabaseClient(); const {data:auth}=await supabase.auth.getUser(); if(!auth.user)return NextResponse.json({error:"Sign in required."},{status:401}); const {data,error}=await supabase.from("admin_audit_log").select("*").order("created_at",{ascending:false}).limit(100); return error?NextResponse.json({error:"Admin audit access required."},{status:403}):NextResponse.json({events:data||[]}); }
