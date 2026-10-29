export const ADDITIONAL_VERIFICATION_REASONS = [
 { id: "missing_document", label: "Missing supporting document", message: "Please upload company letterhead or a business card showing your legal organization name and business contact information." },
 { id: "unreadable_document", label: "Document unreadable or incomplete", message: "We could not read all required information in your document. Please upload a clear, complete PDF or image showing every relevant page, with no cropped business name or contact details." },
 { id: "legal_name_mismatch", label: "Legal name or DBA does not match", message: "The name on your profile does not yet match the supporting record. Please confirm your exact legal name and, if you use a DBA or trade name, provide evidence linking it to the legal entity." },
 { id: "registration_details", label: "Registration details needed", message: "Please confirm your formation state or jurisdiction, business structure, and entity number if one was issued. If your structure does not require state entity registration, provide the appropriate local registration or other establishment evidence." },
 { id: "registry_not_matched", label: "Official registry record not yet matched", message: "We have not yet matched your organization to an official registration record. Please provide your entity number, exact registered name and jurisdiction, or alternative local establishment evidence. A missing search result is not a finding that your business is invalid." },
 { id: "standing_clarification", label: "Current status or standing needs clarification", message: "The available registration information needs clarification before we can complete review. Please provide current official status documentation or evidence of reinstatement, correction, or a pending filing, as applicable." },
 { id: "representative_authority", label: "Representative authority needed", message: "Please provide evidence that you are authorized to represent this organization, such as a signed authorization from an officer or an official record identifying your position." },
 { id: "contact_mismatch", label: "Business contact needs confirmation", message: "Please confirm the main business contact name, monitored email and telephone number. If those differ from the supporting document, explain the relationship or provide updated business contact evidence." },
 { id: "safeguarding_clarification", label: "Safeguarding information needs private review", message: "Please complete the student-safety declarations or request a confidential review with our onboarding team. Do not send sensitive criminal-history documents by email. A disclosure or pending charge does not automatically determine the outcome." },
 { id: "campaign_scope", label: "Campaign, student-contact or NIL scope unclear", message: "Please clarify your proposed partnership, who will interact with students, and whether campaigns involve minors, compensation or NIL activity. Include your safeguarding and compliance contact so we can review the requested permissions." },
] as const;
export const DECLINE_REASONS = [
 { id: "registration_not_established", label: "Required registration not established", message: "We could not establish the registration required for the business structure and jurisdiction you reported after reviewing the available evidence. If you have a correction, official record or applicable registration exemption, you may request reconsideration." },
 { id: "identity_not_established", label: "Organization identity not established", message: "The supplied evidence did not establish the organization identity required for this partnership. You may request reconsideration with current, verifiable documentation." },
 { id: "authority_not_established", label: "Representative authority not established", message: "We could not establish your authority to act for the organization. An authorized representative may contact onboarding or submit corrected authorization evidence." },
 { id: "safeguarding_not_met", label: "Student-safety requirements not met", message: "Following an individual human review, we could not confirm the student-safety requirements needed for this proposed partnership. You may contact onboarding for a confidential explanation, correction or reconsideration. Sensitive details are not included in this email." },
 { id: "unsupported_activity", label: "Proposed activity outside permitted scope", message: "The proposed partnership activity does not meet the platform's current permitted partnership and student-protection requirements. You may request reconsideration with a revised scope." },
 { id: "material_inconsistency", label: "Material evidence inconsistency unresolved", message: "A material inconsistency in the submitted information remains unresolved after review. You may provide a correction or additional evidence and request reconsideration." },
] as const;
export type ReviewOutcome = "under_review" | "needs_information" | "approved" | "rejected";
export function reasonFor(outcome: ReviewOutcome, reasonId: string) {
 return (outcome === "needs_information" ? ADDITIONAL_VERIFICATION_REASONS : outcome === "rejected" ? DECLINE_REASONS : []).find(row => row.id === reasonId);
}
export function buildReviewMessage(outcome: ReviewOutcome, reasonId: string, extra: string) {
 const reason = reasonFor(outcome, reasonId);
 if ((outcome === "needs_information" || outcome === "rejected") && !reason) throw new Error("Select a review reason.");
 const base = outcome === "approved" ? "Your Brand Partner verification has been approved. Your verified Brand Partner workspace is available. Access remains limited to your role, approved activities and existing student privacy and consent rules." : outcome === "under_review" ? "Your Brand Partner verification is under review. Our target is 72 hours from your latest submission; this target does not expire your documents or automatically approve access." : reason!.message;
 return `${base}${extra.trim() ? `\n\nReviewer message: ${extra.trim()}` : ""}`;
}
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
export function buildVerificationEmail(input: { outcome: ReviewOutcome; organizationName: string; publicMessage: string; communicationId: string }) {
 const approved = input.outcome === "approved";
 const subject = `Playbook verification ${approved ? "approved" : input.outcome === "needs_information" ? "— additional information needed" : input.outcome === "rejected" ? "decision" : "under review"} — ${input.organizationName}`.replace(/[\r\n]/g," ");
 const destination = approved ? "/brand-partner-os" : "/brand-partner-os/organization";
 const url = `https://app.playbookseriesinc.org/login?next=${encodeURIComponent(destination)}`;
 const action = approved ? "Open your Brand Partner dashboard" : "Review and update your profile";
 const footer = "For questions or reconsideration, contact onboarding@playbookseriesinc.org. Keep supporting files in your private upload area; do not email sensitive documents. This link requires sign-in and does not grant access by itself.";
 return { subject, url, text: `${input.organizationName}\n\n${input.publicMessage}\n\n${action}: ${url}\n\n${footer}\nReference: ${input.communicationId}`, html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#15243a"><h1>Playbook verification update</h1><p>${escapeHtml(input.organizationName)}</p><p style="white-space:pre-line">${escapeHtml(input.publicMessage)}</p><p><a href="${url}" style="display:inline-block;background:#f97316;color:#fff;padding:14px 20px;border-radius:10px;text-decoration:none">${action}</a></p><p>${escapeHtml(footer)}</p><small>Reference: ${escapeHtml(input.communicationId)}</small></div>` };
}
