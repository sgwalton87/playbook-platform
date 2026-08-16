import { NextResponse } from "next/server";

/**
 * Public Event Bus emission is intentionally disabled.
 *
 * An event is security-relevant provenance: callers must not self-assert the
 * Scholar, actor identity, actor role, event type, or notification recipients.
 * Domain services must publish events only after their own authority contract
 * has been proven.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Direct Playbook event emission is disabled. Use a governed domain publisher.",
      activationState: "governed_event_publisher_required",
    },
    { status: 403 }
  );
}
