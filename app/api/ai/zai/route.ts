import { NextRequest, NextResponse } from "next/server";
import { callZaiChat } from "@/lib/zai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.prompt?.trim()) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const result = await callZaiChat({
      model: body.model || "glm-5.2",
      temperature: body.temperature ?? 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are Playbook AI. Give concise, student-centered, action-oriented guidance.",
        },
        {
          role: "user",
          content: body.prompt,
        },
      ],
    });

    return NextResponse.json({
      ok: true,
      text: result.text,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unable to call Z.ai." },
      { status: 500 }
    );
  }
}
