export type EducatorVerificationStatus = "pending" | "under_review" | "approved" | "rejected";

export interface EducatorVerificationEvidence {
  school: string;
  schoolDistrict: string | null;
  officialEduEmail: string;
  subjectsTaught: string[];
  existingStudentsToSupport: string | null;
  openToLetters: string | null;
  supportFocus: string[];
}

const text = (value: unknown) => String(value ?? "").trim();
const list = (value: unknown) => Array.isArray(value) ? value.map(text).filter(Boolean) : [];

export function buildEducatorVerificationEvidence(data: Record<string, unknown>): EducatorVerificationEvidence {
  const evidence: EducatorVerificationEvidence = {
    school: text(data.school),
    schoolDistrict: text(data.school_district) || null,
    officialEduEmail: text(data.official_edu_email),
    subjectsTaught: list(data.subjects_taught),
    existingStudentsToSupport: text(data.existing_students_to_support) || null,
    openToLetters: text(data.open_to_letters) || null,
    supportFocus: list(data.educator_support_focus),
  };

  if (!evidence.school || !evidence.officialEduEmail) {
    throw new Error("Educator verification requires school and official school email.");
  }

  return evidence;
}

export function educatorAuthorityReady(input: {
  verificationStatus: EducatorVerificationStatus;
  hasActiveEducatorRelationship: boolean;
}) {
  return input.verificationStatus === "approved" && input.hasActiveEducatorRelationship;
}
