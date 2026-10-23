import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPlaybookEmail } from "@/lib/email/emailService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.BRAND_NOTIFICATION_WORKER_SECRET;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !url || !key || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return NextResponse.json({ error: "Delivery worker configuration incomplete." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc("claim_brand_partner_notification");
  if (error) return NextResponse.json({ error: "Unable to claim notification." }, { status: 503 });
  const item = (data as Array<{ request_id: string; organization_name: string; attempt_count: number }> | null)?.[0];
  if (!item) return NextResponse.json({ processed: 0 });
  try {
    await sendPlaybookEmail({
      to: "brandpartners@playbookseriesinc.org",
      cc: "stephishawalton@gmail.com, sycoywalton@playbookseriesinc.org",
      fromType: "notifications",
      subject: "Playbook · New Brand Partner verification submitted",
      text: `A new Brand Partner application awaits independent review.\nOrganization: ${item.organization_name}\nReference: ${item.request_id}\nStatus: pending\n\nReview through an authorized Playbook administrator account. This message is not approval authority.`,
    });
    const completed = await supabase.rpc("finish_brand_partner_notification", {
      p_request_id: item.request_id, p_sent: true, p_error: null
    });
    if (completed.error) throw new Error("Delivery acknowledgement failed");
    return NextResponse.json({ processed: 1, delivered: true });
  } catch (err) {
    await supabase.rpc("finish_brand_partner_notification", {
      p_request_id: item.request_id, p_sent: false,
      p_error: err instanceof Error ? err.name : "unknown delivery error",
    });
    return NextResponse.json({ processed: 1, delivered: false }, { status: 503 });
  }
}
