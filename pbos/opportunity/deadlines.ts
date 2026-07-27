import { digestValue } from "../context";
import type { DeadlineDraft, OpportunityDeadline } from "./contracts";
export function createDeadlines(opportunityId: string, drafts: DeadlineDraft[]): OpportunityDeadline[] { return drafts.map((draft) => ({ deadlineId: `PBOS-OPP-DUE-${digestValue({ opportunityId, ...draft }).slice(0, 16).toUpperCase()}`, opportunityId, ...draft })).sort((a, b) => `${a.date}:${a.deadlineId}`.localeCompare(`${b.date}:${b.deadlineId}`)); }
