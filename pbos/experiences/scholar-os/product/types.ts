export type ScholarPath =
  | "ACADEMIC"
  | "ATHLETIC"
  | "CAREER"
  | "OPPORTUNITY"
  | "FINANCIAL_LITERACY"
  | "MENTORSHIP"
  | "GROWTH";

export interface JourneyGoal {
  readonly id: string;
  readonly scholar_id: string;
  readonly path: ScholarPath;
  readonly statement: string;
  readonly desired_outcome: string;
  readonly owner_confirmed: boolean;
  readonly evidence_ids: readonly string[];
}

export interface JourneyMilestone {
  readonly id: string;
  readonly goal_id: string;
  readonly title: string;
  readonly status: "PLANNED" | "IN_PROGRESS" | "ACHIEVED" | "BLOCKED";
  readonly evidence_ids: readonly string[];
  readonly target_date: string | null;
}

export interface JourneyAction {
  readonly id: string;
  readonly milestone_id: string;
  readonly title: string;
  readonly source: string;
  readonly reasoning: readonly string[];
  readonly confidence: number;
  readonly human_confirmation_required: true;
  readonly confirmed_by_scholar: boolean;
  readonly evidence_ids: readonly string[];
}

export interface JourneyProgress {
  readonly goal_id: string;
  readonly completed_milestones: number;
  readonly total_milestones: number;
  readonly percent: number;
  readonly outcome_evidence_ids: readonly string[];
}

export interface ScholarJourney {
  readonly scholar_id: string;
  readonly current_reality_evidence: readonly string[];
  readonly goals: readonly JourneyGoal[];
  readonly milestones: readonly JourneyMilestone[];
  readonly actions: readonly JourneyAction[];
  readonly progress: readonly JourneyProgress[];
  readonly digest: string;
}

export interface ScholarOpportunity {
  readonly id: string;
  readonly type:
    | "SCHOLARSHIP"
    | "INTERNSHIP"
    | "PROGRAM"
    | "MENTORSHIP"
    | "COMPETITION"
    | "CAREER_PATHWAY";
  readonly title: string;
  readonly source: string;
  readonly provenance: readonly string[];
  readonly evidence_ids: readonly string[];
  readonly eligibility: readonly string[];
  readonly expires_at: string;
}

export interface ScholarSupportRelationship {
  readonly id: string;
  readonly scholar_id: string;
  readonly supporter_id: string;
  readonly role: "PARENT" | "MENTOR" | "COACH" | "COUNSELOR" | "INSTITUTION";
  readonly permissions: readonly string[];
  readonly visible_domains: readonly ScholarPath[];
  readonly consent_id: string;
  readonly expires_at: string;
  readonly revoked_at: string | null;
}

export interface ScholarAcademicState {
  readonly identity: string;
  readonly courses: readonly string[];
  readonly credits: number;
  readonly ag_requirements: readonly string[];
  readonly graduation_requirements: readonly string[];
  readonly college_readiness: readonly string[];
  readonly application_milestones: readonly string[];
  readonly evidence_ids: readonly string[];
}

export interface ScholarAthleticState {
  readonly identity: string;
  readonly sports: readonly string[];
  readonly achievements: readonly string[];
  readonly development_milestones: readonly string[];
  readonly recruiting_readiness: readonly string[];
  readonly opportunity_pathways: readonly string[];
  readonly evidence_ids: readonly string[];
}

export interface ScholarHome {
  readonly scholar_id: string;
  readonly identity: readonly string[];
  readonly mission: string;
  readonly goals: readonly JourneyGoal[];
  readonly progress: readonly JourneyProgress[];
  readonly milestones: readonly JourneyMilestone[];
  readonly recommended_actions: readonly JourneyAction[];
  readonly opportunities: readonly ScholarOpportunity[];
  readonly support_network: readonly ScholarSupportRelationship[];
  readonly achievements: readonly string[];
  readonly academic: ScholarAcademicState;
  readonly athletic: ScholarAthleticState;
  readonly states: readonly (
    | "LOADING"
    | "EMPTY"
    | "SUCCESS"
    | "ERROR"
    | "PERMISSION"
    | "PRIVACY"
  )[];
  readonly digest: string;
}
