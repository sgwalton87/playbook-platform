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

export async function POST(req: NextRequest) {
  try {
    const { base64, mediaType, userId } = await req.json();
    if (!base64 || !userId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const isImage = mediaType.startsWith("image/");

    const contentBlock = isImage ? {
      type: "image",
      source: { type: "base64", media_type: mediaType, data: base64 },
    } : {
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: base64 },
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            contentBlock,
            {
              type: "text",
              text: `You are analyzing a student transcript to extract California A-G course completion data.

Look at all courses listed and categorize them into A-G subjects:
- A = History/Social Science (US History, World History, Government, Economics)
- B = English (English 9, 10, 11, 12, Literature, Composition)
- C = Math (Algebra 1+, Geometry, Algebra 2, Pre-Calc, Calculus, Statistics)
- D = Lab Science (Biology, Chemistry, Physics, Environmental Science)
- E = Language Other Than English (Spanish, French, Mandarin, etc.)
- F = Visual & Performing Arts (Art, Music, Drama, Dance, Film)
- G = College-prep Elective (any additional approved courses)

Count each year-long course as 1.0, each semester course as 0.5.
If a course appears to be currently in progress (current term), mark in_progress as true.

Respond with ONLY this JSON, no explanation, no markdown:
{"A":{"years_completed":0,"in_progress":false},"B":{"years_completed":0,"in_progress":false},"C":{"years_completed":0,"in_progress":false},"D":{"years_completed":0,"in_progress":false},"E":{"years_completed":0,"in_progress":false},"F":{"years_completed":0,"in_progress":false},"G":{"years_completed":0,"in_progress":false}}`,
            },
          ],
        }),
      }),
    });

    const data = await response.json();
    console.log("Claude response:", JSON.stringify(data));

    if(data.error){
      console.error("Claude API error:", data.error);
      return NextResponse.json({ message: "AI service error. Please update manually." });
    }

    const text = data.content?.[0]?.text || "";
    console.log("Claude text:", text);

    let parsed: any = {};
    try {
      // Try to extract JSON even if there's surrounding text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch(e) {
      console.error("Parse error:", e, "Raw text:", text);
      return NextResponse.json({ message: "Could not read transcript format. Please update A-G progress manually by clicking each subject." });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let agUpdates = 0;
    for (const subject of AG_SUBJECTS) {
      const val = parsed[subject.key];
      if (val !== undefined) {
        const { error } = await supabase.from("ag_progress").update({
          years_completed: val.years_completed || 0,
          in_progress: val.in_progress || false,
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId).eq("subject", subject.key);
        if (!error) agUpdates++;
      }
    }

    return NextResponse.json({ agUpdates, parsed });
  } catch (err) {
    console.error("Transcript parse error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
