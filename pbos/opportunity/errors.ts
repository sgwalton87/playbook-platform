import type { OpportunityFailure, OpportunityFailureCode } from "./contracts";
export class OpportunityError extends Error { constructor(public readonly failures: OpportunityFailure[]) { super(failures.map(({ code, message }) => `${code}: ${message}`).join("; ")); this.name = "OpportunityError"; } }
export const opportunityFailure = (code: OpportunityFailureCode, message: string): OpportunityFailure => ({ code, message });
