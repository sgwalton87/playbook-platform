import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { buildAcademicIntelligenceReport } from "@/lib/academic-intelligence";
import { AcademicTranscriptJourneyService } from "@/lib/pbos/academic-transcript-journey";
import { AG_SUBJECTS, normalizeTranscriptDraft, reviewedDraftToAcademicCourses } from "@/lib/academic-transcript-review";
import { PlaybookConnector } from "@/pbos/connector/playbook-connector";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing protected server configuration: ${name}`);
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json() as { submissionId?: unknown; draft?: unknown };
    const submissionId = String(body.submissionId ?? "");
    if (!submissionId) return NextResponse.json({ error: "Transcript submission is required." }, { status: 400 });

    const submission = await supabase
      .from("academic_transcript_submissions")
      .select("id,request_id,status,parsed_payload,parsing_mode,sha256")
      .eq("id", submissionId)
      .eq("owner_id", user.id)
      .single();
    if (submission.error || !submission.data) return NextResponse.json({ error: "Transcript submission was not found." }, { status: 404 });

    const draft = normalizeTranscriptDraft((body.draft && typeof body.draft === "object" ? body.draft : submission.data.parsed_payload) as Record<string, unknown>);

    const removed = await supabase
      .from("academic_transcript_course_evidence")
      .delete()
      .eq("submission_id", submissionId)
      .eq("owner_id", user.id);
    if (removed.error) throw new Error(removed.error.message);

    const evidenceRows = AG_SUBJECTS.flatMap(subject => {
      const value = draft[subject.key];
      const completedCredit = value.courses_taken.length > 0 ? value.years_completed / value.courses_taken.length : 0;
      const completed = value.courses_taken.map(course => ({
        owner_id: user.id,
        submission_id: submissionId,
        ag_category: subject.key,
        course_name: course,
        completion_state: "COMPLETED",
        years_credit: completedCredit,
        provenance: { source: "SCHOLAR_CONFIRMED_TRANSCRIPT", parser: submission.data.parsing_mode, sha256: submission.data.sha256 },
      }));
      const current = value.current_course ? [{
        owner_id: user.id,
        submission_id: submissionId,
        ag_category: subject.key,
        course_name: value.current_course,
        completion_state: "IN_PROGRESS",
        years_credit: 0,
        provenance: { source: "SCHOLAR_CONFIRMED_TRANSCRIPT", parser: submission.data.parsing_mode, sha256: submission.data.sha256 },
      }] : [];
      return [...completed, ...current];
    });

    if (evidenceRows.length > 0) {
      const inserted = await supabase.from("academic_transcript_course_evidence").insert(evidenceRows);
      if (inserted.error) throw new Error(inserted.error.message);
    }

    let agUpdates = 0;
    for (const subject of AG_SUBJECTS) {
      const value = draft[subject.key];
      const updated = await supabase.from("ag_progress").upsert({
        user_id: user.id,
        subject: subject.key,
        subject_name: subject.name,
        years_required: subject.required,
        years_completed: value.years_completed,
        in_progress: value.in_progress,
        courses_taken: value.courses_taken,
        current_course: value.current_course,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,subject" });
      if (updated.error) throw new Error(updated.error.message);
      agUpdates += 1;
    }

    const readiness = buildAcademicIntelligenceReport(reviewedDraftToAcademicCourses(draft));
    const client = new PlaybookPbosRuntimeClient(new SignedPlaybookPbosTransport(required("PBOS_API_URL"), {
      organizationId: required("PBOS_ORGANIZATION_ID"),
      connectorId: required("PBOS_CONNECTOR_ID"),
      keyId: required("PBOS_CONNECTOR_KEY_ID"),
      secretBase64: required("PBOS_CONNECTOR_SECRET_BASE64"),
    }));
    const connector = new PlaybookConnector(client);
    const journey = new AcademicTranscriptJourneyService({
      async saveEvidence(input) {
        const saved = await supabase.from("academic_journey_evidence").upsert({
          owner_id: input.ownerId,
          readiness_score: input.readinessScore,
          ag_updates: input.agUpdates,
          idempotency_key: input.idempotencyKey,
          provenance: input.provenance,
        }, { onConflict: "idempotency_key" }).select("id").single();
        if (saved.error || !saved.data) throw new Error(saved.error?.message ?? "Academic evidence persistence failed.");
        return { evidenceId: saved.data.id as string };
      },
      async completeEvidence(input) {
        const completed = await supabase.from("academic_journey_evidence").update({
          delivery_state: "DELIVERED",
          provenance: input.provenance,
          delivered_at: new Date().toISOString(),
        }).eq("id", input.evidenceId).eq("owner_id", input.ownerId);
        if (completed.error) throw new Error(completed.error.message);
      },
    }, {
      registerIdentity: userId => connector.registerIdentity(userId, "SCHOLAR"),
      async publish(identity, evidenceId, readinessScore, correlationId) {
        const response = await client.send("PUBLISH_LIFECYCLE_EVENT", {
          connectorId: "PLAYBOOK-CONNECTOR-001",
          domainRegistrationId: "PLAYBOOK-SCHOLAR-REGISTRATION-001",
          identityMappingId: identity.mappingId,
          correlationId,
          purpose: "Publish scholar-confirmed academic readiness evidence.",
          payload: { eventType: "ACADEMIC_READINESS_UPDATED", schemaVersion: "1.0.0", evidenceId, readinessScore },
        }, correlationId, correlationId);
        if (!response.success) throw new Error(response.error.message);
        return response.provenance;
      },
    });

    const evidence = await journey.complete({
      actorId: user.id,
      ownerId: user.id,
      approvalId: required("PBOS_ACADEMIC_JOURNEY_APPROVAL_ID"),
      readinessScore: readiness.score,
      agUpdates,
      idempotencyKey: `transcript-confirm-${submissionId}`,
    });

    const confirmed = await supabase.from("academic_transcript_submissions").update({
      parsed_payload: draft,
      status: "CONFIRMED",
      confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", submissionId).eq("owner_id", user.id);
    if (confirmed.error) throw new Error(confirmed.error.message);

    return NextResponse.json({ ok: true, submissionId, agUpdates, readiness, evidence, reviewStatus: "CONFIRMED" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Transcript confirmation failed." }, { status: 500 });
  }
}
