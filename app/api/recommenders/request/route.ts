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

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({error:"Authentication required."},{status:401});
    await requireLearnerAuthority(supabase,user.id,{requireOnboarding:true});
    const {data,error}=await supabase.from("recommender_requests")
      .select("id,recommender_name,recommender_email,recommender_role,opportunity_name,status,created_at")
      .eq("scholar_id",user.id).order("created_at",{ascending:false}).limit(100);
    if(error) throw new Error(error.message);
    const relationships=await supabase.from("support_relationships")
      .select("id,supporter_name,supporter_email,relationship,permissions,status")
      .eq("scholar_id",user.id).eq("status","active");
    if(relationships.error) throw new Error(relationships.error.message);
    const innerCircle=(relationships.data??[]).filter(x =>
      Array.isArray(x.permissions) && x.permissions.includes("support_tasks")
    ).map(x=>({id:x.id,name:x.supporter_name??"Connected supporter",
      email:x.supporter_email,relationship:x.relationship}));
    return NextResponse.json({requests:data??[],innerCircle});
  } catch {
    return NextResponse.json({error:"Unable to load recommendation requests."},{status:503});
  }
}

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

    const source=body.source;
    if(source!=="inner-circle" && source!=="outside") {
      return NextResponse.json({error:"Choose Inner Circle or outside recommender."},{status:400});
    }
    if(source==="inner-circle"){
      if(typeof body.relationshipId!=="string") {
        return NextResponse.json({error:"Select a verified Inner Circle relationship."},{status:400});
      }
      const connected=await supabase.from("support_relationships")
        .select("supporter_name,supporter_email,permissions")
        .eq("id",body.relationshipId).eq("scholar_id",user.id).eq("status","active").maybeSingle();
      if(connected.error||!connected.data || !Array.isArray(connected.data.permissions) ||
          !connected.data.permissions.includes("support_tasks") ||
          connected.data.supporter_email.toLowerCase() !== String(body.recommenderEmail??"").trim().toLowerCase()) {
        return NextResponse.json({error:"Recommender must have an active authorized Inner Circle relationship."},{status:403});
      }
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

    const draft = updateRecommenderRequestStatus(request, "draft");
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
        status: draft.status,
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

    const marked = await supabase.from("recommender_requests").update({status:"sent"}).eq("id",data.id).eq("scholar_id",user.id);
    if(marked.error) return NextResponse.json({error:"Email accepted but status synchronization failed; check requests before retrying."},{status:503});

    return NextResponse.json({
      ok: true,
      request: {...data,status:"sent"},
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
