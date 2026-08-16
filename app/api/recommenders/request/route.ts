import { NextRequest, NextResponse } from "next/server";
import { requireLearnerAuthority } from "@/lib/auth/learner-authority";
import { sendPlaybookEmail } from "@/lib/email";
import {
  buildRecommenderEmail,
  buildRecommenderRequest,
  isRecommenderRole,
  updateRecommenderRequestStatus,
} from "@/lib/recommenders";
import { requireUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await requireLearnerAuthority(supabase, user.id, { requireOnboarding: true });

    const profile = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    if (profile.error) throw new Error(profile.error.message);
    if (!profile.data) return NextResponse.json({ error: "A durable learner profile is required." }, { status: 409 });

    const body = await req.json() as Record<string, unknown>;
    if (body.scholarId != null && String(body.scholarId) !== user.id) {
      return NextResponse.json({ error: "Recommendation requests may only be created for the authenticated learner." }, { status: 403 });
    }

    if (!isRecommenderRole(body.recommenderRole)) {
      return NextResponse.json(
        { error: "Recommender role must be educator, mentor, coach, family, or employer." },
        { status: 400 }
      );
    }

    const evidence = Array.isArray(body.evidence)
      ? body.evidence.filter((item): item is string => typeof item === "string").slice(0, 50)
      : [];

    const request = buildRecommenderRequest({
      scholarId: user.id,
      scholarName: profile.data.full_name || "Playbook Scholar",
      recommenderName: String(body.recommenderName ?? ""),
      recommenderEmail: String(body.recommenderEmail ?? ""),
      recommenderRole: body.recommenderRole,
      opportunityName: String(body.opportunityName ?? ""),
      evidence,
    });

    const sent = updateRecommenderRequestStatus(request, "sent");
    const { data, error } = await supabase
      .from("recommender_requests")
      .insert({
        scholar_id: user.id,
        scholar_name: request.scholarName,
        recommender_name: request.recommenderName,
        recommender_email: request.recommenderEmail,
        recommender_role: request.recommenderRole,
        opportunity_name: request.opportunityName,
        evidence: request.evidence,
        status: sent.status,
      })
      .select("id,scholar_id,scholar_name,recommender_name,recommender_email,recommender_role,opportunity_name,status,created_at")
      .single();
    if (error) throw new Error(error.message);

    const email = buildRecommenderEmail({
      recommenderName: request.recommenderName,
      scholarName: request.scholarName,
      opportunityName: request.opportunityName,
      requestUrl: `${req.nextUrl.origin}/recommenders/${data.id}`,
    });

    await sendPlaybookEmail({
      to: request.recommenderEmail,
      subject: email.subject,
      text: email.text,
      fromType: "onboarding",
    });

    return NextResponse.json({
      ok: true,
      request: data,
      email,
      deliveryStatus: "sent",
      eventState: "governed_event_publisher_pending",
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create recommender request." },
      { status: 400 }
    );
  }
}
