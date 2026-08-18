import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { validateTranscriptInput } from "@/lib/pbos/academic-transcript-journey";
import { AgParseResult, parseTextPdfTranscript } from "@/lib/academic-transcript-fallback";
import { normalizeTranscriptDraft } from "@/lib/academic-transcript-review";

type AnthropicResponse = { content?: { text?: string }[]; error?: unknown };

const PROMPT = `Analyze this student transcript and return only JSON containing California A-G categories A through G. For each category include years_completed, years_required, in_progress, courses_taken, and current_course. Count only visible passing coursework when grades are available. Do not infer courses that are not visible.`;

function safeFileName(fileName: string): string {
  const cleaned = fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "transcript";
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

    const body = await request.json() as { base64?: unknown; mediaType?: unknown; fileName?: unknown; requestId?: unknown };
    const base64 = String(body.base64 ?? "");
    const mediaType = String(body.mediaType ?? "");
    const fileName = safeFileName(String(body.fileName ?? "transcript"));
    validateTranscriptInput(base64, mediaType);

    const fileBuffer = Buffer.from(base64, "base64");
    const sha256 = createHash("sha256").update(fileBuffer).digest("hex");
    const requestId = String(body.requestId ?? `transcript-${user.id}-${sha256.slice(0, 20)}`);

    const existing = await supabase
      .from("academic_transcript_submissions")
      .select("id,parsed_payload,parsing_mode,status")
      .eq("owner_id", user.id)
      .eq("sha256", sha256)
      .maybeSingle();

    if (existing.error) throw new Error(existing.error.message);
    if (existing.data) {
      return NextResponse.json({
        ok: true,
        submissionId: existing.data.id,
        draft: existing.data.parsed_payload,
        parsingMode: existing.data.parsing_mode,
        reviewStatus: existing.data.status,
        duplicate: true,
      });
    }

    const anthropicKey = process.env.ANTHROPIC_API_KEY ?? "";
    const providerConfigured = anthropicKey.startsWith("sk-ant-") && anthropicKey.length > 32 && !/[\s/]/.test(anthropicKey);
    let aiResponse: Response | null = null;

    if (providerConfigured) {
      try {
        aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 2200,
            messages: [{ role: "user", content: [
              { type: mediaType.startsWith("image/") ? "image" : "document", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: PROMPT },
            ] }],
          }),
        });
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

    if (!parsed) {
      return NextResponse.json({
        error: aiResponse?.ok
          ? "Transcript evidence could not be extracted."
          : "Transcript intelligence is temporarily unavailable and this file requires approved OCR.",
      }, { status: aiResponse?.ok ? 422 : 502 });
    }

    const draft = normalizeTranscriptDraft(parsed);
    const storagePath = `${user.id}/${sha256}/${fileName}`;
    const upload = await supabase.storage.from("academic-transcripts").upload(storagePath, fileBuffer, {
      contentType: mediaType,
      upsert: false,
    });
    if (upload.error && !/already exists/i.test(upload.error.message)) throw new Error(upload.error.message);

    const saved = await supabase.from("academic_transcript_submissions").insert({
      owner_id: user.id,
      request_id: requestId,
      file_name: fileName,
      media_type: mediaType,
      byte_size: fileBuffer.byteLength,
      sha256,
      storage_bucket: "academic-transcripts",
      storage_path: storagePath,
      parsing_mode: parsingMode,
      parsed_payload: draft,
      status: "REVIEW_REQUIRED",
    }).select("id,status").single();

    if (saved.error || !saved.data) throw new Error(saved.error?.message ?? "Transcript review record could not be created.");

    return NextResponse.json({
      ok: true,
      submissionId: saved.data.id,
      draft,
      parsingMode,
      reviewStatus: saved.data.status,
      duplicate: false,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Transcript analysis failed." }, { status: 500 });
  }
}
