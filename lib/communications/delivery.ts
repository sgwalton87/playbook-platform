import "server-only";

import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { emitTelemetry, incrementMetric } from "@/lib/observability";
import type { TelemetryContext } from "@/lib/observability";

type ServerSupabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export type DeliveryPurpose = "admin_verification" | "guardian_update";

export async function beginDelivery(
  supabase: ServerSupabase,
  input: {
    commandKey: string;
    purpose: DeliveryPurpose;
    relationshipId: string | null;
    recipientHash: string;
    telemetry?: Partial<TelemetryContext>;
  },
): Promise<
  | { ok: true; attemptId: string; created: true }
  | { ok: true; attemptId: string; created: false; status: string }
  | { ok: false }
> {
  const { data, error } = await supabase.rpc("begin_communication_delivery", {
    p_command_key: input.commandKey,
    p_purpose: input.purpose,
    p_relationship_id: input.relationshipId,
    p_provider: "resend",
    p_recipient_hash: input.recipientHash,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    incrementMetric("database_rpc_failure_total");
    await emitTelemetry({ severity: "error", service: "playbook-communications", component: "delivery-audit", operation: "begin_delivery", outcome: "failure", context: input.telemetry, errorClassification: "DeliveryAuditUnavailable", dependency: "supabase-rpc", metadata: { purpose: input.purpose } });
    return { ok: false };
  }
  const result = data as Record<string, unknown>;
  if (typeof result.attemptId !== "string" || typeof result.created !== "boolean") return { ok: false };
  return result.created
    ? { ok: true, attemptId: result.attemptId, created: true }
    : { ok: true, attemptId: result.attemptId, created: false, status: String(result.status ?? "unknown") };
}

export async function finishDelivery(
  supabase: ServerSupabase,
  input: {
    attemptId: string;
    status: "delivered_to_provider" | "failed";
    providerMessageId?: string | null;
    errorCode?: string | null;
    telemetry?: Partial<TelemetryContext>;
  },
): Promise<boolean> {
  const { error } = await supabase.rpc("finish_communication_delivery", {
    p_attempt_id: input.attemptId,
    p_status: input.status,
    p_provider_message_id: input.providerMessageId ?? "",
    p_error_code: input.errorCode ?? "",
  });
  if (input.status === "failed") incrementMetric("delivery_failure_total");
  if (error) incrementMetric("database_rpc_failure_total");
  await emitTelemetry({
    severity: error || input.status === "failed" ? "error" : "info",
    service: "playbook-communications",
    component: "delivery-audit",
    operation: "finish_delivery",
    context: input.telemetry,
    outcome: error || input.status === "failed" ? "failure" : "success",
    errorClassification: error ? "DeliveryAuditWriteFailed" : input.errorCode ?? undefined,
    dependency: "resend",
    metadata: { status: input.status },
  });
  return !error;
}
