export type PortfolioEventType =
  | "ProfileCreated"
  | "PortfolioUpdated"
  | "CourseCompleted"
  | "CertificateIssued"
  | "BadgeEarned"
  | "ActivityAdded"
  | "LeadershipVerified"
  | "RecommendationRequested"
  | "RecommendationApproved"
  | "ResumeGenerated"
  | "OpportunityMatched";

export interface PortfolioEvent {
  id?: string;
  scholarId: string;
  type: PortfolioEventType;
  source?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}
