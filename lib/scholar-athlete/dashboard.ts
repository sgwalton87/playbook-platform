import type { AthleteLevel, AthleteVisibility, NILOpportunityType } from "./contracts";
import type { GoverningPath } from "./types";
import type { NILDealStage } from "./nilEngine";
import type { RecruitingStage } from "./recruitingEngine";

export type AthleteProfileProjection = {
  id: string;
  scholarId: string;
  sport: string;
  secondarySport: string | null;
  position: string | null;
  secondaryPosition: string | null;
  graduationYear: number;
  athleteLevel: AthleteLevel;
  governingPath: GoverningPath;
  recruitingStatus: string;
  highlightUrl: string | null;
  bio: string | null;
  location: string | null;
  teams: string[];
  leagues: string[];
  awards: string[];
  leadershipExperience: string[];
  visibility: AthleteVisibility;
  verificationState: string;
  updatedAt: string;
};

export type RecruitingTargetProjection = {
  id: string;
  schoolName: string;
  athleticProgram: string | null;
  division: string | null;
  coachName: string | null;
  coachEmail: string | null;
  stage: RecruitingStage;
  nextAction: string | null;
  nextActionDueAt: string | null;
  notes: string | null;
  createdAt: string;
};

export type NILDealProjection = {
  id: string;
  brandName: string;
  opportunityTitle: string;
  opportunityType: NILOpportunityType;
  stage: NILDealStage;
  compensationType: string | null;
  compensationAmount: number | null;
  contractStatus: string;
  disclosureStatus: string;
  complianceStatus: string;
  paymentStatus: string;
  jurisdiction: string | null;
  institutionName: string | null;
  sourceName: string | null;
  createdAt: string;
};

export type NILProfileProjection = {
  id: string;
  athleteProfileId: string;
  brandStatement: string | null;
  brandValues: string[];
  brandCategories: string[];
  partnershipInterests: string[];
  socialPresence: Array<{ platform: string; handle: string; url?: string }>;
  visibility: "private" | "network" | "marketplace";
  discoverable: boolean;
  marketplaceConsentAt: string | null;
  verificationState: string;
};

export type ScholarAthleteDashboardData = {
  scholar: {
    id: string;
    name: string;
    school: string | null;
    gpa: number | null;
  };
  athleteProfile: AthleteProfileProjection | null;
  nilProfile: NILProfileProjection | null;
  recruitingTargets: RecruitingTargetProjection[];
  nilDeals: NILDealProjection[];
  recentRecruitingActivityCount: number;
};

export function calculateAthleteProfileReadiness(
  profile: AthleteProfileProjection | null,
): { score: number; missing: string[] } {
  if (!profile) return { score: 0, missing: ["athlete profile"] };
  const checks = [
    [Boolean(profile.sport), "primary sport"],
    [Boolean(profile.position), "position"],
    [Boolean(profile.graduationYear), "graduation year"],
    [Boolean(profile.bio), "athlete biography"],
    [profile.teams.length > 0, "team history"],
    [profile.awards.length > 0, "achievements or awards"],
    [Boolean(profile.highlightUrl), "highlight reel"],
    [profile.visibility !== "private", "recruiting visibility decision"],
  ] as const;
  const missing = checks.filter(([complete]) => !complete).map(([, label]) => label);
  return { score: Math.round(((checks.length - missing.length) / checks.length) * 100), missing };
}

export function getNILNextStage(stage: NILDealStage): NILDealStage | null {
  const next: Partial<Record<NILDealStage, NILDealStage>> = {
    lead: "conversation",
    conversation: "negotiation",
    negotiation: "review",
    review: "signed",
    signed: "active",
    active: "completed",
  };
  return next[stage] ?? null;
}
