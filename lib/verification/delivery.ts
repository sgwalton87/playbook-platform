import { sendPlaybookEmail } from "@/lib/email/emailService";
import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildVerificationEmail, type ReviewOutcome } from "./templates";
type Client = Awaited<ReturnType<typeof createServerSupabaseClient>>;
export async function dispatchReviewEmail(supabase: Client, communicationId: string) {
 const claim = await supabase.rpc("claim_brand_review_email", { requested_id: communicationId });
 if (claim.error) throw new Error("Communication access is unavailable.");
 if (!claim.data) return { status: "unchanged", message: "This message is already claimed or has been sent. Check the communication log." };
 const row = claim.data as { id: string; claim_token: string; recipient_email: string; organization_name: string; outcome: ReviewOutcome; public_message: string };
 let status: "sent" | "failed" | "delivery_unknown" = "failed";
 let explanation = "Email sending is not configured. The saved review is unchanged; an admin can retry when SMTP is configured.";
 let providerId: string | null = null;
 if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
   const email = buildVerificationEmail({ outcome: row.outcome, organizationName: row.organization_name, publicMessage: row.public_message, communicationId: row.id });
   const result = await sendPlaybookEmail({ to: row.recipient_email, ...email, fromType: "onboarding", replyToType: "onboarding", messageId: `<verification-${row.id}@playbookseriesinc.org>` });
   status = result.accepted?.length ? "sent" : "failed";
   providerId = result.messageId ?? null;
   explanation = status === "sent" ? "Accepted by the mail server. Inbox delivery is not independently confirmed." : "The mail server did not accept the recipient. The review remains saved.";
  } catch (cause) {
   const code = cause && typeof cause === "object" && "code" in cause ? String(cause.code) : "";
   status = ["EAUTH", "ECONNECTION", "EDNS", "EENVELOPE"].includes(code) ? "failed" : "delivery_unknown";
   explanation = status === "failed" ? "The message was not accepted. Check mail configuration and retry from the communication log." : "Mail acceptance is uncertain. Verify the mailbox before retrying to avoid duplicate messages.";
  }
 }
 const finished = await supabase.rpc("finish_brand_review_email", { requested_id: row.id, requested_claim: row.claim_token, requested_status: status, requested_error: status === "sent" ? null : explanation, requested_message_id: providerId });
 if (finished.error) return { status: "delivery_unknown", message: "The review is saved, but the mail receipt could not be recorded. Check the mailbox and communication log before retrying." };
 return { status, message: explanation };
}
