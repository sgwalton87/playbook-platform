import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const AG_SUBJECTS = [
  { key: "A", name: "History / Social Science", required: 2 },
  { key: "B", name: "English", required: 4 },
  { key: "C", name: "Math", required: 3 },
  { key: "D", name: "Lab Science", required: 2 },
  { key: "E", name: "Language Other Than English", required: 2 },
  { key: "F", name: "Visual & Performing Arts", required: 1 },
  { key: "G", name: "Elective", required: 1 },
];

const PROMPT = "You are analyzing a student transcript to extract California A-G course completion data.\n\nLook at all courses listed and categorize them:\n- A = History/Social Science (US History, World History, Government, Economics)\n- B = English (English 9-12, Literature, Composition)\n- C = Math (Algebra 1+, Geometry, Algebra 2, Pre-Calc, Calculus, Statistics)\n- D = Lab Science (Biology, Chemistry, Physics, Environmental Science)\n- E = Language Other Than English (Spanish, French, Mandarin, etc.)\n- F = Visual & Performing Arts (Art, Music, Drama, Dance, Film, Photography)\n- G = College-prep Elective (Personal Finance, Psychology, additional approved courses)\n\nCount each year-long course (1 credit) as 1.0, each semester course (0.5 credit) as 0.5.\nIf a course is currently in progress, set in_progress to true.\n\nRespond with ONLY valid JSON, no explanation, no markdown backticks:\n{\"A\":{\"years_completed\":0,\"in_progress\":false},\"B\":{\"years_completed\":0,\"in_progress\":false},\"C\":{\"years_completed\":0,\"in_progress\":false},\"D\":{\"years_completed\":0,\"in_progress\":false},\"E\":{\"years_completed\":0,\"in_progress\":false},\"F\":{\"years_completed\":0,\"in_progress\":false},\"G\":{\"years_completed\":0,\"in_progress\":false}}";

export async function POST(req: NextRequest) {
  try {
    const { base64, mediaType, userId } = await req.json();
    if (!base64 || !userId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const isImage = mediaType.startsWith("image/");
    const contentBlock = isImage
      ? { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } }
      : { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [contentBlock, { type: "text", text: PROMPT }],
        }],
      }),
    });

    const data = await response.json();
    console.log("Claude raw response:", JSON.stringify(data));

    if (data.error) {
      console.error("Claude API error:", data.error);
      return NextResponse.json({ message: "AI service error. Please update manually." });
    }

    const text = data.content?.[0]?.text || "";
    console.log("Claude text:", text);

    let parsed: any = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error("JSON parse error:", e, "Raw:", text);
      return NextResponse.json({ message: "Could not read transcript. Please click each A-G subject to update manually." });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let agUpdates = 0;
    for (const subject of AG_SUBJECTS) {
      const val = parsed[subject.key];
      if (val !== undefined) {
        const { error } = await supabase
          .from("ag_progress")
          .update({
            years_completed: val.years_completed || 0,
            in_progress: val.in_progress || false,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .eq("subject", subject.key);
        if (!error) agUpdates++;
      }
    }

    return NextResponse.json({ agUpdates, parsed });
  } catch (err) {
    console.error("Transcript parse error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
