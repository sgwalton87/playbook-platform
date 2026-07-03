export function getStudioEventFeed() {
  return [
    { event: "TranscriptImported", status: "complete", detail: "Transcript Intelligence started." },
    { event: "AcademicDNAGenerated", status: "complete", detail: "Strength signals created." },
    { event: "OpportunityGraphMatched", status: "complete", detail: "Opportunities matched." },
    { event: "CompassBriefingCreated", status: "complete", detail: "Next actions generated." },
    { event: "OracleAnswered", status: "complete", detail: "Question answered from learner context." },
    { event: "ScholarRecordUpdated", status: "pending", detail: "Evidence sync queued." },
  ];
}
