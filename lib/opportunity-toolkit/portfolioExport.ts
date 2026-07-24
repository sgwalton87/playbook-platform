export function buildPortfolioPacket(input: {
  scholarName: string;
  resume: LegacyValue;
  bragSheet: LegacyValue;
  recommendationLetter?: string;
  evidenceLinks?: string[];
  targetUse: "college" | "scholarship" | "internship" | "job" | "recruiting" | "nil";
}) {
  return {
    title: `${input.scholarName} Portfolio Packet`,
    targetUse: input.targetUse,
    included: {
      resume: Boolean(input.resume),
      bragSheet: Boolean(input.bragSheet),
      recommendationLetter: Boolean(input.recommendationLetter),
      evidenceLinks: input.evidenceLinks || [],
    },
    exportStatus: "ready_for_pdf_foundation",
  };
}
