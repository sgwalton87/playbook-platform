export type RecruitingVerificationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface RecruitingVerificationEvidence {
  collegeName: string;
  conference: string | null;
  divisionLevel: string | null;
  officialEduEmail: string;
  primarySportRecruiting: string;
  positionsRecruiting: string | null;
  recruitingRadius: string[];
  graduationClassesRecruiting: string[];
  preferredRecruitingContact: string | null;
  authorizationStatus: string | null;
}

const text = (value: unknown) => String(value ?? "").trim();
const list = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : [];

export function buildRecruitingVerificationEvidence(data: Record<string, unknown>): RecruitingVerificationEvidence {
  const evidence: RecruitingVerificationEvidence = {
    collegeName: text(data.college_name),
    conference: text(data.conference) || null,
    divisionLevel: text(data.division_level) || null,
    officialEduEmail: text(data.official_edu_email),
    primarySportRecruiting: text(data.primary_sport_recruiting),
    positionsRecruiting: text(data.positions_recruiting) || null,
    recruitingRadius: list(data.recruiting_radius),
    graduationClassesRecruiting: list(data.graduation_classes_recruiting),
    preferredRecruitingContact: text(data.preferred_recruiting_contact) || null,
    authorizationStatus: text(data.ncaa_id_status) || null,
  };
  if (!evidence.collegeName || !evidence.officialEduEmail || !evidence.primarySportRecruiting) {
    throw new Error("Recruiting verification requires institution, official institutional email, and primary recruiting sport.");
  }
  return evidence;
}

export function recruitingAuthorityReady(input: {
  verificationStatus: RecruitingVerificationStatus;
  hasApprovedRecruitingScope: boolean;
}) {
  return input.verificationStatus === "approved" && input.hasApprovedRecruitingScope;
}
