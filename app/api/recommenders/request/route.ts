import { NextRequest, NextResponse } from "next/server";
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

    const email = buildRecommenderEmail({
      recommenderName: request.recommenderName,
      scholarName: request.scholarName,
      opportunityName: request.opportunityName,
      requestUrl: `${req.nextUrl.origin}/recommenders`,
    });

    return NextResponse.json({
      ok: true,
      request: sent,
      email,
      deliveryStatus: "prepared",
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create recommender request." },
      { status: 500 }
    );
  }
}
