import { buildAcademicDNA } from "@/lib/academic-intelligence";
import { matchOpportunitiesFromSignals } from "../matching/OpportunityMatcher";
import { saveOpportunityGraphMatches } from "@/lib/repositories/opportunityGraphRepository";

export async function handleTranscriptImportedForOpportunityGraph(payload: LegacyValue) {
  if (!payload?.recordId) return;

  const dna = buildAcademicDNA(payload.courses || []);

  const report = matchOpportunitiesFromSignals({
    skills: dna.strengths,
    majors: dna.interests,
    careers: dna.careerSignals,
    opportunities: dna.opportunitySignals,
  });

  await saveOpportunityGraphMatches({
    recordId: payload.recordId,
    profileId: payload.profileId,
    matches: report.matches,
  });

  return report;
}

export async function buildOpportunityGraphFromAcademicDNA(input: {
  recordId?: string;
  profileId?: string;
  courses: LegacyValue[];
}) {
  const dna = buildAcademicDNA(input.courses || []);

  const report = matchOpportunitiesFromSignals({
    skills: dna.strengths,
    majors: dna.interests,
    careers: dna.careerSignals,
    opportunities: dna.opportunitySignals,
  });

  if (input.recordId) {
    await saveOpportunityGraphMatches({
      recordId: input.recordId,
      profileId: input.profileId,
      matches: report.matches,
    });
  }

  return report;
}
