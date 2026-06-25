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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [
            {
              type: mediaType === "application/pdf" ? "document" : "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `Analyze this student transcript and extract California A-G course completion data. 
For each A-G subject category (A through G), determine how many years/units the student has completed.
Return ONLY a JSON object with this exact format, no other text:
{
  "A": { "years_completed": 0, "in_progress": false },
  "B": { "years_completed": 0, "in_progress": false },
  "C": { "years_completed": 0, "in_progress": false },
  "D": { "years_completed": 0, "in_progress": false },
  "E": { "years_completed": 0, "in_progress": false },
  "F": { "years_completed": 0, "in_progress": false },
  "G": { "years_completed": 0, "in_progress": false }
}
A = History/Social Science (2 years needed)
B = English (4 years needed)
C = Math - Algebra 1 and above (3 years needed)
D = Lab Science (2 years needed)
E = Language Other Than English (2 years needed)
F = Visual & Performing Arts (1 year needed)
G = College-prep elective (1 year needed)
If a course is currently in progress (current semester), set in_progress to true.
Count each year-long course as 1 year, each semester course as 0.5 years.`,
            },
          ],
        }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    let parsed: any = {};
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(clean);
    } catch {
      return NextResponse.json({ message: "Could not parse transcript automatically. Please update manually." });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let agUpdates = 0;
    for (const subject of AG_SUBJECTS) {
      const val = parsed[subject.key];
      if (val && (val.years_completed > 0 || val.in_progress)) {
        await supabase.from("ag_progress").update({
          years_completed: val.years_completed,
          in_progress: val.in_progress,
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId).eq("subject", subject.key);
        agUpdates++;
      }
    }

    return NextResponse.json({ agUpdates, parsed });
  } catch (err) {
    console.error("Transcript parse error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
