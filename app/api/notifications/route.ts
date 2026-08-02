import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { emitTelemetry, incrementMetric } from "@/lib/observability";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    incrementMetric("database_query_failure_total");
    await emitTelemetry({ severity: "error", service: "playbook-api", component: "notifications", operation: "list_notifications", outcome: "failure", errorClassification: "NotificationQueryFailed", dependency: "supabase-query" });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data?.length) incrementMetric("notification_total", data.length);
  return NextResponse.json({ notifications: data || [] });
}
