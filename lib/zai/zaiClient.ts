export type ZaiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callZaiChat(input: {
  messages: ZaiMessage[];
  model?: string;
  temperature?: number;
  timeoutMs?: number;
}) {
  const apiKey = process.env.ZAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ZAI_API_KEY");
  }

  const res = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: input.model || "glm-5.2",
      messages: input.messages,
      temperature: input.temperature ?? 0.4,
    }),
    signal: AbortSignal.timeout(input.timeoutMs ?? 12_000),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || "Z.ai request failed");
  }

  return {
    text: json?.choices?.[0]?.message?.content || "",
  };
}
