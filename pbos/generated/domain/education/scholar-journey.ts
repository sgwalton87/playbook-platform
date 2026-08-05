import { randomUUID } from "crypto";
export type OnboardingStatus = "STARTED" | "IDENTITY_VERIFIED" | "GOALS_CAPTURED" | "DASHBOARD_READY";
export interface Scholar { id: string; email: string; status: OnboardingStatus; provenance: string[] }
export interface ScholarGoal { id: string; scholarId: string; title: string; status: "ACTIVE"; provenance: string[] }
export interface ScholarDashboard { scholarId: string; goalIds: string[]; generatedFrom: string[] }
export class ScholarJourney {
  begin(email: string): Scholar { if (!email.includes("@")) throw new Error("Valid email required."); return { id: randomUUID(), email, status: "STARTED", provenance: [] }; }
  verifyIdentity(scholar: Scholar, approvalId?: string): Scholar { if (!approvalId) throw new Error("Identity approval required."); return { ...scholar, status: "IDENTITY_VERIFIED", provenance: [...scholar.provenance, approvalId] }; }
  captureGoal(scholar: Scholar, title: string): ScholarGoal { if (scholar.status !== "IDENTITY_VERIFIED") throw new Error("Verified identity required."); if (!title.trim()) throw new Error("Goal title required."); return { id: randomUUID(), scholarId: scholar.id, title, status: "ACTIVE", provenance: [...scholar.provenance, scholar.id] }; }
  projectDashboard(scholar: Scholar, goals: ScholarGoal[], exchangeApprovalId?: string): ScholarDashboard { if (!exchangeApprovalId) throw new Error("PBOS data exchange approval required."); if (goals.some(goal => goal.scholarId !== scholar.id)) throw new Error("Cross-scholar projection denied."); return { scholarId: scholar.id, goalIds: goals.map(goal => goal.id), generatedFrom: [...scholar.provenance, exchangeApprovalId] }; }
}
