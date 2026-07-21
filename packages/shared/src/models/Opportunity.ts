import type { OpportunityType } from "../enums/OpportunityType";

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  organization?: string;
  deadline?: string;
  status?: string;
}
