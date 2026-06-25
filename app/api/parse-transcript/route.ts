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
  "Analyze this student transcript and extract California A-G completion data.",
  "A=History/Social Science, B=English, C=Math, D=Lab Science, E=World Language, F=Arts, G=Elective.",
  "Count 1-credit courses as 1.0, 0.5-credit as 0.5. Mark in_progress=true if currently taking.",
  'Return ONLY valid JSON like: {"A":{"years_completed":2,"in_progress":false},"B":{"years_completed":3,"in_progress":true},"C":{"years_completed":2,"in_progress":false},"D":{"years_completed":1,"in_progress":false},"E":{"years_completed":2,"in_progress":false},"F":{"years_completed":1,"in_progress":false},"G":{"years_completed":1,"in_progress":false}}',
].join(" ");

export async function POST(req: NextRequest) {
  try {
    const { base64, mediaType, userId } = await req.json();
    if (!base64 || !userId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const isImage = mediaType.startsWith("image/");
    const sourceBlock = isImage
      ? { type: "base64", media_type: mediaType, data: base64 }
      : { type: "base64", media_type: "application/pdf", data: base64 };

    const contentBlock = isImage
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
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              contentBlock,
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    const data = await apiResponse.json();
    console.log("Claude response:", JSON.stringify(data).slice(0, 500));

    if (data.error) {
      console.error("Claude API error:", data.error);
      return NextResponse.json({ message: "AI error. Please update manually." });
    }

    const text = data.content?.[0]?.text || "";
    console.log("Claude text:", text);

    let parsed: Record<string, any> = {};
    try {
      const jsonBlock = text.match(/```json([\s\S]*?)```/);
      const rawJson = jsonBlock ? jsonBlock[1].trim() : text.match(/\{[\s\S]*\}/)?.[0];
      if (!rawJson) throw new Error("No JSON found");
      parsed = JSON.parse(rawJson);
      console.log("Parsed AG data:", JSON.stringify(parsed));
    } catch {
      return NextResponse.json({ message: "Could not read transcript. Click each subject to update manually." });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let agUpdates = 0;
    for (const s of AG_SUBJECTS) {
      const val = parsed[s.key];
      if (val !== undefined) {
        const { error, data: updateData } = await supabase
          .from("ag_progress")
          .update({
            years_completed: Number(val.years_completed) || 0,
            in_progress: Boolean(val.in_progress),
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("subject", s.key)
          .select();
        console.log(`Update ${s.key}:`, error||"ok", updateData);
        if (!error) agUpdates++;
      }
    }

    return NextResponse.json({ agUpdates, parsed });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
