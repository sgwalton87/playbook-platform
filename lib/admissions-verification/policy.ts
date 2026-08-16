export type AdmissionsVerificationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface AdmissionsVerificationEvidence {
  collegeName: string;
  department: string;
  admissionsRegion: string | null;
  officialEduEmail: string;
  minimumGpaThreshold: string | null;
  targetMajors: string[];
  studentPopulations: string[];
  studentContactPreference: string | null;
  engagementOpportunities: string[];
}

const text = (value: unknown) => String(value ?? "").trim();
const list = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : [];

export function buildAdmissionsVerificationEvidence(data: Record<string, unknown>): AdmissionsVerificationEvidence {
  const evidence = {
    collegeName: text(data.college_name),
    department: text(data.department),
    admissionsRegion: text(data.admissions_region) || null,
    officialEduEmail: text(data.official_edu_email),
    minimumGpaThreshold: text(data.minimum_gpa_threshold) || null,
    targetMajors: list(data.target_majors),
    studentPopulations: list(data.student_populations),
    studentContactPreference: text(data.student_contact_preference) || null,
    engagementOpportunities: list(data.engagement_opportunities),
  };
  if (!evidence.collegeName || !evidence.department || !evidence.officialEduEmail) {
    throw new Error("Admissions verification requires institution, department, and official institutional email.");
  }
  return evidence;
}

export function admissionsAuthorityReady(input: { verificationStatus: AdmissionsVerificationStatus; hasApprovedAdmissionsScope: boolean }) {
  return input.verificationStatus === "approved" && input.hasApprovedAdmissionsScope;
}
