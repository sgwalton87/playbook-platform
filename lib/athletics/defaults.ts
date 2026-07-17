import type { AthleticsProfile } from "./types";

export function createDefaultAthletics(): AthleticsProfile {
  return {
    status: {
      isAthlete: false,
      careerStage: "other",
      participationStatus: "active",
    },

    goals: {
      dream: null,
      shortTerm: [],
      longTerm: [],
      afterSports: [],
    },

    sports: [],

    affiliations: [],

    measurements: [],

    metrics: [],

    rankings: [],

    achievements: [],

    eligibility: {
      ncaaStatus: undefined,
      naiaStatus: undefined,
      academicStanding: undefined,
      amateurStatus: undefined,
    },

    recruiting: {
      openToRecruiting: false,
      desiredLevels: [],
      desiredSchools: [],
    },

    media: {
      gameFilm: [],
      interviews: [],
      articles: [],
      socialLinks: {},
    },

    contacts: [],

    nil: {
      interested: false,
      partnerships: [],
    },

    international: {
      eligibleCountries: [],
      languages: [],
    },

    transition: {
      retired: false,
      careerGoals: [],
      educationGoals: [],
      coachingGoals: [],
      businessGoals: [],
    },

    timeline: [],
  };
}