import type { PlaybookRecord } from "./types";

export type ScholarProfileForm = {
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  gender: string;
  dateOfBirth: string;
  favoriteQuote: string;

  school: string;
  grade: string;
  district: string;
  graduationYear: string;

  weightedGpa: string;
  unweightedGpa: string;

  currentMath: string;
currentEnglish: string;
currentScience: string;

  city: string;
  zipCode: string;

  elaScore: string;
  mathScore: string;
  satScore: string;
  actScore: string;

  intendedMajor: string;
  idealProfession: string;

  dreamSchool: string;
  collegeList: string[];

  pillars: string[];
  activities: Array<Record<string, unknown>>;
  engagementPreferences: string[];
  supporters: string[];

  transcriptUploaded: boolean;
  transcriptFilename: string;
  transcriptUrl: string;

  onboarding: Record<string, unknown>;
};

function formString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export function scholarRecordToProfileForm(
  record: PlaybookRecord
): ScholarProfileForm {
  const dreamSchool =
    record.college.dreamSchoolName ||
    record.college.dreamSchool ||
    "";

  /*
   * The Profile editor describes this field as nine additional
   * schools. Remove the dream school from this editable list so
   * the dream school is not displayed twice.
   */
  const collegeList = record.college.topSchools.filter(
    (school) =>
      school.trim().toLowerCase() !==
      dreamSchool.trim().toLowerCase()
  );

  return {
    firstName: formString(record.identity.firstName),
    lastName: formString(record.identity.lastName),
    fullName: formString(record.identity.fullName),
    username: formString(record.identity.username),
    avatarUrl: formString(record.identity.avatarUrl),
    coverUrl: formString(record.identity.coverUrl),
    bio: formString(record.identity.bio),
    gender: formString(record.identity.gender),
    dateOfBirth: formString(record.identity.dateOfBirth),
    favoriteQuote: formString(record.identity.favoriteQuote),

    school: formString(record.academic.school),
    grade: formString(record.academic.grade),
    district: formString(
      record.academic.schoolDistrict
    ),
    graduationYear: formString(
      record.academic.graduationYear
    ),

    weightedGpa: formString(
      record.academic.weightedGpa
    ),
    unweightedGpa: formString(
      record.academic.unweightedGpa
    ),

    currentMath: formString(
  record.academic.currentMath
),

currentEnglish: formString(
  record.academic.currentEnglish
),

currentScience: formString(
  record.academic.currentScience
),

    city: formString(record.identity.city),
    zipCode: formString(record.identity.zipCode),

    elaScore: formString(record.academic.elaScore),
    mathScore: formString(record.academic.mathScore),
    satScore: formString(record.academic.satScore),
    actScore: formString(record.academic.actScore),

    intendedMajor: formString(
      record.academic.intendedMajor
    ),
    idealProfession: formString(
      record.academic.idealProfession
    ),

    dreamSchool,
    collegeList,

    pillars: [...record.community.pillars],
    activities: [...record.community.activities],
    engagementPreferences: [
      ...record.community.engagementPreferences,
    ],
    supporters: [...record.community.supporters],

    transcriptUploaded:
      record.transcript.uploaded,
    transcriptFilename: formString(
      record.transcript.filename
    ),
    transcriptUrl: formString(
      record.transcript.uploadUrl
    ),

    onboarding: {
      ...record.onboarding,
    },
  };
}
