import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { AcademicTranscriptJourneyService, validateTranscriptInput } from "@/lib/pbos/academic-transcript-journey";
import { buildAcademicIntelligenceReport } from "@/lib/academic-intelligence";
import { PlaybookConnector } from "@/pbos/connector/playbook-connector";
import { PlaybookPbosRuntimeClient } from "@/pbos/connector/pbos-runtime-client";
import { SignedPlaybookPbosTransport } from "@/pbos/connector/signed-server-transport";
import { AgParseResult, parseTextPdfTranscript } from "@/lib/academic-transcript-fallback";

const AG_SUBJECTS = [
  { key: "A", name: "History / Social Science", required: 2 }, { key: "B", name: "English", required: 4 },
  { key: "C", name: "Mathematics", required: 3 }, { key: "D", name: "Laboratory Science", required: 2 },
  { key: "E", name: "Language Other Than English", required: 2 }, { key: "F", name: "Visual & Performing Arts", required: 1 },
  { key: "G", name: "College-Preparatory Elective", required: 1 }
] as const;
type AnthropicResponse = { content?: { text?: string }[]; error?: unknown };

const PROMPT = `Analyze this student transcript and return only JSON containing California A-G categories A through G. For each category include years_completed, years_required, in_progress, courses_taken, and current_course. Count only visible passing coursework when grades are available.`;
function required(name: string): string { const value = process.env[name]; if (!value) throw new Error("Missing protected server configuration: " + name); return value; }

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const body = await request.json() as { base64?: unknown; mediaType?: unknown; requestId?: unknown };
    const base64 = String(body.base64 ?? ""); const mediaType = String(body.mediaType ?? "");
    validateTranscriptInput(base64, mediaType);
    const requestId = String(body.requestId ?? "transcript-" + user.id + "-" + createHash("sha256").update(base64).digest("hex").slice(0, 16));
    const anthropicKey = process.env.ANTHROPIC_API_KEY ?? "";
    const providerConfigured = anthropicKey.startsWith("sk-ant-") && anthropicKey.length > 32
      && !/[\s/]/.test(anthropicKey);
    let aiResponse: Response | null = null;
    if (providerConfigured) {
      try {
        aiResponse = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: {
          "content-type": "application/json", "x-api-key": anthropicKey, "anthropic-version": "2023-06-01"
        }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 2000, messages: [{ role: "user", content: [
          { type: mediaType.startsWith("image/") ? "image" : "document", source: { type: "base64", media_type: mediaType, data: base64 } },
          { type: "text", text: PROMPT }
        ] }] }) });
      } catch {
        aiResponse = null;
      }
    }
    let parsed: AgParseResult | null = null;
    let parsingMode: "ANTHROPIC" | "LOCAL_TEXT_PDF" = "ANTHROPIC";
    if (aiResponse?.ok) {
      const ai = await aiResponse.json() as AnthropicResponse;
      const text = ai.error ? "" : ai.content?.[0]?.text ?? "";
      const raw = text.match(/```json([\s\S]*?)```/)?.[1]?.trim() ?? text.match(/\{[\s\S]*\}/)?.[0];
      if (raw) {
        try { parsed = JSON.parse(raw) as AgParseResult; } catch { parsed = null; }
      }
    }
    if (!parsed) {
      parsed = parseTextPdfTranscript(base64, mediaType);
      parsingMode = "LOCAL_TEXT_PDF";
    }
    if (!parsed) return NextResponse.json({ error: aiResponse?.ok
      ? "Transcript evidence could not be extracted."
      : "Transcript intelligence is temporarily unavailable and this file requires approved OCR." }, { status: aiResponse?.ok ? 422 : 502 });
    let agUpdates = 0;
    for (const subject of AG_SUBJECTS) {
      const value = parsed[subject.key] ?? {};
      const result = await supabase.from("ag_progress").upsert({ user_id: user.id, subject: subject.key,
        subject_name: subject.name, years_required: Number(value.years_required ?? subject.required),
        years_completed: Number(value.years_completed ?? 0), in_progress: Boolean(value.in_progress),
        courses_taken: Array.isArray(value.courses_taken) ? value.courses_taken : [], current_course: value.current_course ?? null,
        updated_at: new Date().toISOString() }, { onConflict: "user_id,subject" });
      if (result.error) throw new Error(result.error.message); agUpdates += 1;
    }
    const courses = Object.entries(parsed).flatMap(([category, value]) => (value?.courses_taken ?? []).map(course => ({
      name: typeof course === "string" ? course : "Transcript course", subject: category, credits: 10,
      agCategory: category as "A" | "B" | "C" | "D" | "E" | "F" | "G", completed: true
    })));
    const readiness = buildAcademicIntelligenceReport(courses);
    const client = new PlaybookPbosRuntimeClient(new SignedPlaybookPbosTransport(required("PBOS_API_URL"), {
      organizationId: required("PBOS_ORGANIZATION_ID"), connectorId: required("PBOS_CONNECTOR_ID"),
      keyId: required("PBOS_CONNECTOR_KEY_ID"), secretBase64: required("PBOS_CONNECTOR_SECRET_BASE64")
    }));
    const connector = new PlaybookConnector(client);
    const journey = new AcademicTranscriptJourneyService({
      async saveEvidence(input) {
        const saved = await supabase.from("academic_journey_evidence").upsert({ owner_id: input.ownerId,
          readiness_score: input.readinessScore, ag_updates: input.agUpdates, idempotency_key: input.idempotencyKey,
          provenance: input.provenance }, { onConflict: "idempotency_key" }).select("id").single();
        if (saved.error || !saved.data) throw new Error(saved.error?.message ?? "Academic evidence persistence failed.");
        return { evidenceId: saved.data.id as string };
      },
      async completeEvidence(input) {
        const completed = await supabase.from("academic_journey_evidence").update({ delivery_state: "DELIVERED",
          provenance: input.provenance, delivered_at: new Date().toISOString() }).eq("id", input.evidenceId).eq("owner_id", input.ownerId);
        if (completed.error) throw new Error(completed.error.message);
      }
    }, {
      registerIdentity: userId => connector.registerIdentity(userId, "SCHOLAR"),
      async publish(identity, evidenceId, readinessScore, correlationId) {
        const response = await client.send("PUBLISH_LIFECYCLE_EVENT", { connectorId: "PLAYBOOK-CONNECTOR-001",
          domainRegistrationId: "PLAYBOOK-SCHOLAR-REGISTRATION-001", identityMappingId: identity.mappingId,
          correlationId, purpose: "Publish approved academic readiness evidence.", payload: {
            eventType: "ACADEMIC_READINESS_UPDATED", schemaVersion: "1.0.0", evidenceId, readinessScore
          } }, correlationId, correlationId);
        if (!response.success) throw new Error(response.error.message); return response.provenance;
      }
    });
    const evidence = await journey.complete({ actorId: user.id, ownerId: user.id,
      approvalId: required("PBOS_ACADEMIC_JOURNEY_APPROVAL_ID"), readinessScore: readiness.score, agUpdates, idempotencyKey: requestId });
    return NextResponse.json({ ok: true, agUpdates, readiness, evidence, parsingMode });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Transcript journey failed." }, { status: 500 });
  }
}
