import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { status: "alive", service: "playbook-platform", timestamp: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
