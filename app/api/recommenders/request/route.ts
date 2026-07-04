import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { sendPlaybookEmail } from "@/lib/email";
import {
  buildRecommenderEmail,
  buildRecommenderRequest,
  updateRecommenderRequestStatus,
} from "@/lib/recommenders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const request = buildRecommenderRequest({
      scholarId: body.scholarId,
      scholarName: body.scholarName,
      recommenderName: body.recommenderName,
      recommenderEmail: body.recommenderEmail,
      recommenderRole: body.recommenderRole,
      opportunityName: body.opportunityName,
      evidence: body.evidence || [],
    });

    const sent = updateRecommenderRequestStatus(request, "sent");

    const { data, error } = await supabase
      .from("recommender_requests")
      .insert({
        scholar_id: body.scholarId,
        scholar_name: request.scholarName,
        recommender_name: request.recommenderName,
        recommender_email: request.recommenderEmail,
        recommender_role: request.recommenderRole,
        opportunity_name: request.opportunityName,
        evidence: request.evidence,
        status: sent.status,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const email = buildRecommenderEmail({
      recommenderName: request.recommenderName,
      scholarName: request.scholarName,
      opportunityName: request.opportunityName,
      requestUrl: `${req.nextUrl.origin}/recommenders/${data.id}`,
    });

    await supabase.from("playbook_events").insert({
      type: "action.assigned",
      scholar_id: body.scholarId,
      payload: {
        title: "Recommendation request sent",
        detail: `${request.recommenderName} was asked to write a letter for ${request.opportunityName}.`,
      },
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
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create recommender request." },
      { status: 500 }
    );
  }
}
