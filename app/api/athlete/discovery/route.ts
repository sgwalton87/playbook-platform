import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { data, error } = await supabase.rpc("discover_nil_athletes");
  if (error) return NextResponse.json({ error: "Registered brand partner access is required." }, { status: 403 });
  return NextResponse.json({ athletes: data ?? [] });
}
