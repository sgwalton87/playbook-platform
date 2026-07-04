export type ScenarioType =
  | "raise_grade"
  | "submit_fafsa"
  | "verify_evidence"
  | "complete_internship"
  | "add_mentor";

export function runScenario(type: ScenarioType) {
  const scenarios = {
    raise_grade: {
      title: "Raise Algebra from B to A",
      changes: {
        academicDNA: 4,
        opportunityScore: 6,
        trustScore: 1,
        scholarshipPotential: 2500,
      },
    },
    submit_fafsa: {
      title: "Submit FAFSA",
      changes: {
        academicDNA: 0,
        opportunityScore: 12,
        trustScore: 3,
        scholarshipPotential: 12000,
      },
    },
    verify_evidence: {
      title: "Verify Biology Evidence",
      changes: {
        academicDNA: 2,
        opportunityScore: 8,
        trustScore: 10,
        scholarshipPotential: 4200,
      },
    },
    complete_internship: {
      title: "Complete Internship",
      changes: {
        academicDNA: 5,
        opportunityScore: 15,
        trustScore: 8,
        scholarshipPotential: 6500,
      },
    },
    add_mentor: {
      title: "Add Mentor",
      changes: {
        academicDNA: 0,
        opportunityScore: 5,
        trustScore: 4,
        scholarshipPotential: 1500,
      },
    },
  };

  return scenarios[type];
}
