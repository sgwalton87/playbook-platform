import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { snapshotPlatformMetrics } from "@/lib/observability";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const configured = process.env.PLAYBOOK_OBSERVABILITY_SECRET?.trim();
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  const authorized = Boolean(configured && supplied && configured.length === supplied.length && timingSafeEqual(Buffer.from(configured), Buffer.from(supplied)));
  if (!authorized) {
    return NextResponse.json({ ok: false, error: "Not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ ok: true, service: "playbook-platform", metrics: snapshotPlatformMetrics() }, { headers: { "Cache-Control": "no-store" } });
}
