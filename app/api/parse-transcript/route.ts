import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const AG_SUBJECTS = [
  { key: "A", required: 2 },
  { key: "B", required: 4 },
  { key: "C", required: 3 },
  { key: "D", required: 2 },
  { key: "E", required: 2 },
  { key: "F", required: 1 },
  { key: "G", required: 1 },
];

const PROMPT = [
  "Analyze this student transcript and extract California A-G course completion data.",
  "Categorize each course: A=History/Social Science, B=English, C=Math, D=Lab Science, E=World Language, F=Visual/Performing Arts, G=College-prep Elective.",
  "Count year-long courses as 1.0 and semester courses as 0.5.",
  "Return ONLY valid JSON.",
  '{"A":{"years_completed":2,"in_progress":false,"courses_taken":["U.S. History"]},"B":{"years_completed":4,"in_progress":false,"courses_taken":["English 9"]},"C":{"years_completed":3,"in_progress":false,"courses_taken":["Algebra I"]},"D":{"years_completed":2,"in_progress":false,"courses_taken":["Biology"]},"E":{"years_completed":2,"in_progress":false,"courses_taken":["Spanish I"]},"F":{"years_completed":1,"in_progress":false,"courses_taken":["Art"]},"G":{"years_completed":1,"in_progress":false,"courses_taken":["Personal Finance"]}}',
].join(" ");

export async function POST(req: NextRequest) {
  try {
    const { base64, mediaType, userId } = await req.json();

    if (!base64 || !mediaType || !userId) {
      return NextResponse.json({ error: "Missing transcript data." }, { status: 400 });
    }

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
        max_tokens: 1200,
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
      return NextResponse.json(
        { error: "AI transcript reader failed. Please update A-G manually." },
        { status: 400 }
      );
    }

    const text = data.content?.[0]?.text || "";
    const rawJson = text.match(/```json([\s\S]*?)```/)?.[1]?.trim() || text.match(/\{[\s\S]*\}/)?.[0];

    if (!rawJson) {
      return NextResponse.json(
        { error: "Could not extract A-G JSON from transcript." },
        { status: 400 }
      );
    }

    const parsed = JSON.parse(rawJson);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let agUpdates = 0;

    for (const subject of AG_SUBJECTS) {
      const val = parsed[subject.key] || {};

      const payload = {
        user_id: userId,
        subject: subject.key,
        years_required: subject.required,
        years_completed: Number(val.years_completed) || 0,
        in_progress: Boolean(val.in_progress),
        courses_taken: Array.isArray(val.courses_taken) ? val.courses_taken : [],
        current_course: val.current_course || null,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from("ag_progress")
        .select("id")
        .eq("user_id", userId)
        .eq("subject", subject.key)
        .maybeSingle();

      const result = existing?.id
        ? await supabase.from("ag_progress").update(payload).eq("id", existing.id)
        : await supabase.from("ag_progress").insert(payload);

      if (!result.error) agUpdates++;
    }

    return NextResponse.json({ ok: true, agUpdates, parsed });
  } catch (err) {
    console.error("parse-transcript error:", err);
    return NextResponse.json({ error: "Server error parsing transcript." }, { status: 500 });
  }
}
