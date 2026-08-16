export type CounselorVerificationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface CounselorVerificationEvidence {
  school: string;
  schoolDistrict: string | null;
  officialEmail: string;
  counselorScope: string[];
}

const text = (value: unknown) => String(value ?? "").trim();
const list = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : [];

export function buildCounselorVerificationEvidence(data: Record<string, unknown>): CounselorVerificationEvidence {
  const evidence: CounselorVerificationEvidence = {
    school: text(data.school),
    schoolDistrict: text(data.school_district) || null,
    officialEmail: text(data.official_email),
    counselorScope: list(data.counselor_scope),
  };

  if (!evidence.school || !evidence.officialEmail) {
    throw new Error("Counselor verification requires school and official school email.");
  }

  return evidence;
}

export function counselorAuthorityReady(input: {
  verificationStatus: CounselorVerificationStatus;
  hasActiveCounselorRelationship: boolean;
}) {
  return input.verificationStatus === "approved" && input.hasActiveCounselorRelationship;
}
