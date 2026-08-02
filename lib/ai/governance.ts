import "server-only";

import { createHash } from "node:crypto";
import type { createServerSupabaseClient } from "@/lib/supabase/server";

type ServerSupabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;
export const hashAIContent = (value: string) => createHash("sha256").update(value).digest("hex");

export async function beginAIGuidanceRun(supabase: ServerSupabase, prompt: string): Promise<string | null> {
  const { data, error } = await supabase.rpc("begin_ai_guidance_run", { p_prompt_hash: hashAIContent(prompt) });
  return error || typeof data !== "string" ? null : data;
}

export async function finishAIGuidanceRun(
  supabase: ServerSupabase,
  input: { runId: string; status: "completed" | "failed"; output?: string; errorCode?: string },
): Promise<boolean> {
  const { error } = await supabase.rpc("finish_ai_guidance_run", {
    p_run_id: input.runId,
    p_status: input.status,
    p_output_hash: input.output ? hashAIContent(input.output) : "",
    p_error_code: input.errorCode ?? "",
  });
  return !error;
}
