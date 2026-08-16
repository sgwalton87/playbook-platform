import { NextResponse } from "next/server";

/**
 * Direct reward emission is intentionally disabled.
 *
 * Coins and XP are derived outcomes and may only be issued by a governed
 * lifecycle event whose source evidence can be verified server-side. A public
 * request must never choose its own Scholar, event type, or reward source.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Direct reward emission is disabled. Rewards must originate from a governed Playbook lifecycle event.",
      activationState: "governed_issuer_required",
    },
    { status: 403 }
  );
}
