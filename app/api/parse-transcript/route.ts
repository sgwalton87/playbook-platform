import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const AG_SUBJECTS = [
  { key: "A", name: "History / Social Science", required: 2 },
  { key: "B", name: "English", required: 4 },
  { key: "C", name: "Mathematics", required: 3 },
  { key: "D", name: "Laboratory Science", required: 2 },
  { key: "E", name: "Language Other Than English", required: 2 },
  { key: "F", name: "Visual & Performing Arts", required: 1 },
  { key: "G", name: "College-Preparatory Elective", required: 1 },
];

type TranscriptParseBody = {
  base64?: string;
  mediaType?: string;
};

type AgSubjectResult = {
  years_required?: number | string;
  years_completed?: number | string;
  in_progress?: boolean;
  courses_taken?: unknown[];
  current_course?: string | null;
};

type AgParseResult = Record<string, AgSubjectResult | undefined>;

const PROMPT = `
Analyze this student transcript and extract California A-G course completion data.

Categories:
A = History/Social Science
B = English
C = Mathematics
D = Laboratory Science
E = Language Other Than English
F = Visual and Performing Arts
G = College-Preparatory Elective

For each category, return:
- years_completed
- years_required
- in_progress
- courses_taken with course name and grade if visible

Count semester courses as 0.5 years and year-long courses as 1.0 year.
Only courses completed with C or better should count as completed when grades are visible.
If grade is not visible, include the course but still estimate completion from the transcript.

Return ONLY valid JSON like this:
{
  "A": {
    "years_completed": 2,
    "years_required": 2,
    "in_progress": false,
    "courses_taken": ["World History - A", "US History - B"]
  }
}
`;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const { base64, mediaType } = (await req.json()) as TranscriptParseBody;

    const allowedMedia = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!base64 || !mediaType || !allowedMedia.includes(mediaType)) {
      return NextResponse.json({ error: "Missing transcript data." }, { status: 400 });
    }
    if (base64.length > 14_000_000) return NextResponse.json({ error: "Transcript exceeds the 10 MB upload limit." }, { status: 413 });
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Transcript reader is not configured." }, { status: 503 });

    const sourceBlock = {
      type: "base64",
      media_type: mediaType,
      data: base64,
    };

    const contentBlock = mediaType.startsWith("image/")
      ? { type: "image", source: sourceBlock }
      : { type: "document", source: sourceBlock };

    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [contentBlock, { type: "text", text: PROMPT }],
          },
        ],
      }),
    });

    const data = await apiResponse.json();

    if (data.error) {
      console.error("Transcript AI error:", data.error);
      return NextResponse.json(
        { error: "AI transcript reader failed. Please update manually." },
        { status: 400 }
      );
    }

    const text = data.content?.[0]?.text || "";
    const rawJson =
      text.match(/```json([\s\S]*?)```/)?.[1]?.trim() ||
      text.match(/\{[\s\S]*\}/)?.[0];

    if (!rawJson) {
      console.error("No JSON found in transcript response:", text);
      return NextResponse.json(
        { error: "Could not extract A-G data from transcript." },
        { status: 400 }
      );
    }

    const parsed = JSON.parse(rawJson) as AgParseResult;

    let agUpdates = 0;
    const saved: unknown[] = [];

    for (const subject of AG_SUBJECTS) {
      const val = parsed[subject.key] || {};

      const payload = {
        user_id: auth.user.id,
        subject: subject.key,
        subject_name: subject.name,
        years_required: Math.max(0, Math.min(8, Number(val.years_required || subject.required))),
        years_completed: Math.max(0, Math.min(8, Number(val.years_completed || 0))),
        in_progress: Boolean(val.in_progress),
        courses_taken: Array.isArray(val.courses_taken) ? val.courses_taken : [],
        current_course: val.current_course || null,
        updated_at: new Date().toISOString(),
      };

      const { data: row, error } = await supabase
        .from("ag_progress")
        .upsert(payload, { onConflict: "user_id,subject" })
        .select()
        .single();

      if (error) {
        console.error(`A-G upsert failed for ${subject.key}:`, error);
      } else {
        agUpdates++;
        saved.push(row);
      }
    }

    return NextResponse.json({
      ok: true,
      agUpdates,
      parsed,
      saved,
    });
  } catch (err) {
    console.error("parse-transcript error:", err);
    return NextResponse.json(
      { error: "Server error parsing transcript." },
      { status: 500 }
    );
  }
}
