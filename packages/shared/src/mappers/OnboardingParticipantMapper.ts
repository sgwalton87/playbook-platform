import { Participant } from "../models";

export interface OnboardingInput {
  [key: string]: unknown;
}

export function mapOnboardingToParticipant(
  input: OnboardingInput
): Participant {
  const now = new Date().toISOString();

  return {
    identity: {
      id: String(input.id ?? ""),
      username: input.username as string | undefined,
      avatarUrl: input.avatarUrl as string | undefined,
      role: String(input.role ?? "scholar"),
      registrationType: input.registrationType as string | undefined,
      onboarded: true,
    },

    school: {
      school: String(input.school ?? ""),
      district: String(input.district ?? ""),
      city: String(input.city ?? ""),
      state: String(input.state ?? ""),
      zipCode: String(input.zipCode ?? ""),
      grade: String(input.grade ?? ""),
      graduationYear: String(input.gradYear ?? ""),
      dreamSchoolName: input.dreamSchoolName as string | undefined,
      dreamSchoolId: input.dreamSchoolId as string | undefined,
      englishLanguageLearner: Boolean(input.ell),
    },

    academics: {
      weightedGPA:
        input.gpa !== undefined && input.gpa !== ""
          ? Number(input.gpa)
          : undefined,

      unweightedGPA: undefined,

      classRank: undefined,

      satScore: undefined,

      actScore: undefined,

      currentMath: undefined,

      currentEnglish: undefined,

      currentScience: undefined,

      currentCourses: [],

      transcript: {
        weightedGPA: undefined,
        unweightedGPA: undefined,
        creditsEarned: undefined,
        currentCourses: [],
        completedCourses: [],
      },

      aToGCompleted: [],

      aToGMissing: [],

      fafsaCompleted: false,

      collegeGoal: {
        dreamSchoolName: input.dreamSchoolName as string | undefined,
        dreamSchoolId: input.dreamSchoolId as string | undefined,
        intendedMajor: undefined,
        desiredDivision: undefined,
        recruitingInterest: undefined,
      },

      idealProfession: input.idealProfession as string | undefined,

      desiredSalaryRange:
        input.desiredSalaryRange as string | undefined,
    },

    background: {
      gender: input.gender as string | undefined,
      race: input.race as string | undefined,
      householdIncome:
        input.householdIncome as string | undefined,

      firstGeneration: Boolean(input.firstGeneration),

      fosterYouth: Boolean(input.fosterYouth),

      unhoused: Boolean(input.unhoused),

      migrant: Boolean(input.migrant),

      freeReducedLunch: Boolean(input.freeReducedLunch),

      hasIEP: Boolean(input.hasIEP),

      bio: input.bio as string | undefined,
    },

    athletics: undefined,

    recruiting: undefined,

    nil: undefined,

    interests: {
      careers: [],
      colleges: [],
      majors: [],
      industries: [],
    },

    activities: {
      items: [],
    },

    supportNetwork: {
      startingFive: [],
    },

    progress: {
      xp: 0,
      coins: 0,
      level: 1,
      streak: 0,
      completedCourses: 0,
      earnedCertificates: 0,
      earnedBadges: 0,
    },

    metadata: {
      createdAt: now,
      updatedAt: now,
      onboardingCompleted: true,
      profileCompletion: 100,
    },
  };
}
