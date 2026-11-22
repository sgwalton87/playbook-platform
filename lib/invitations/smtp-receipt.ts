import { createClient } from "@supabase/supabase-js";

export async function recordSupportInvitationSmtpReceipt(invitationId: string, messageId: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Invitation receipt storage is unavailable.");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const result = await client.from("support_invitation_smtp_receipts").insert({
    invitation_id: invitationId,
    message_id: messageId,
  });
  if (result.error) throw new Error("Could not persist the invitation SMTP receipt.");
}
