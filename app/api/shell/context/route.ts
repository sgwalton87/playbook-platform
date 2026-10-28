import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { isPlatformOperatorRole } from "@/lib/auth/platformOperator";

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const profile = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error("Account context could not be loaded.");
    const isReviewer = isPlatformOperatorRole(profile.data?.role);

    const [evidence, pendingVerification, unreadAttention, support] = await Promise.all([
      supabase.from("evidence").select("id", { count: "exact", head: true }).is("deleted_at", null),
      isReviewer
        ? supabase.rpc("get_verification_review_queue")
        : supabase.from("verifications").select("id", { count: "exact", head: true }).eq("status", "pending").is("deleted_at", null),
      supabase.from("pbos_notifications").select("id", { count: "exact", head: true }).eq("read", false),
      supabase.from("support_relationships").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);

    const failures = [evidence, pendingVerification, unreadAttention, support].filter((result) => result.error);
    if (failures.length) throw new Error(failures.map((result) => result.error?.message).filter(Boolean).join("; "));

    return NextResponse.json({
      evidenceCount: evidence.count ?? 0,
      pendingVerificationCount: isReviewer
        ? (Array.isArray(pendingVerification.data) ? pendingVerification.data.length : 0)
        : pendingVerification.count ?? 0,
      unreadAttentionCount: unreadAttention.count ?? 0,
      activeSupportCount: support.count ?? 0,
    }, { headers: { "Cache-Control": "no-store, private" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Shell context could not be loaded." }, { status: 500 });
  }
}
