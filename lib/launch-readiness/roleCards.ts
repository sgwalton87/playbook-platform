import type { LaunchDashboardSummary } from "./types";
import type { PlaybookRoleOS } from "@/lib/role-os";

export function buildRoleDashboardCards(role: PlaybookRoleOS, summary: LaunchDashboardSummary | null) {
  if (!summary) return [{ id: "select-scholar", title: "Select an active Scholar", body: "Choose an authorized Scholar relationship in the shell before viewing individual progress, evidence, actions, or opportunities.", href: "/support-network", action: "Review relationships" }];
  const shared = [
    { id: "evidence", title: "Evidence completion", body: `${summary.trust.verifiedCount} of ${summary.trust.evidenceCount} evidence items are verified; ${summary.trust.pendingVerificationCount} reviews are pending.`, href: "/evidence", action: "Review evidence" },
    { id: "actions", title: "Support actions", body: `${summary.openActionCount} governed handoffs are open for this Scholar.`, href: "/action-routing", action: "Open handoffs" },
  ];
  const roleCard = {
    family: { title: "Family support cue", body: "Focus on deadlines, encouragement, and Scholar-confirmed support tasks." },
    educator: { title: "Educator review cue", body: "Prioritize pending verification and evidence-backed academic interventions." },
    mentor: { title: "Mentor guidance cue", body: "Translate the next evidence-backed step into confidence and follow-through." },
    district: { title: "District relationship cue", body: "Use consented individual context only; aggregate equity reporting remains a separate governed surface." },
    university: { title: "University outreach cue", body: "Use verified evidence and Scholar-consented institutional purpose before outreach." },
    employer: { title: "Employer opportunity cue", body: "Review only verified, public evidence connected to a governed opportunity." },
    learner: { title: "Scholar cue", body: "Choose the next evidence-backed action you want to take." },
  }[role];
  return [{ id: "role", ...roleCard, href: "/record", action: "Open Scholar Record" }, ...shared];
}
