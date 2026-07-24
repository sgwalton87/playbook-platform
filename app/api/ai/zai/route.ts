import { NextRequest, NextResponse } from "next/server";
import { callZaiChat } from "@/lib/zai";

type ZaiRequestBody = {
  prompt?: string;
  model?: string;
  temperature?: number;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to call Z.ai.";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ZaiRequestBody;

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
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
