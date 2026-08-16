export type DistrictVerificationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface DistrictVerificationEvidence {
  schoolDistrict: string;
  school: string | null;
  officialEmail: string;
  administratorTitle: string;
  administrativeScope: string[];
}

const text = (value: unknown) => String(value ?? "").trim();
const list = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : [];

export function buildDistrictVerificationEvidence(data: Record<string, unknown>): DistrictVerificationEvidence {
  const evidence: DistrictVerificationEvidence = {
    schoolDistrict: text(data.school_district),
    school: text(data.school) || null,
    officialEmail: text(data.official_email),
    administratorTitle: text(data.administrator_title),
    administrativeScope: list(data.administrative_scope),
  };

  if (!evidence.schoolDistrict || !evidence.officialEmail || !evidence.administratorTitle) {
    throw new Error("District verification requires district, official institutional email, and administrator title.");
  }

  return evidence;
}

export function districtAuthorityReady(input: {
  verificationStatus: DistrictVerificationStatus;
  hasApprovedAdministrativeScope: boolean;
}) {
  return input.verificationStatus === "approved" && input.hasApprovedAdministrativeScope;
}
