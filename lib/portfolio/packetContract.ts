export const PORTFOLIO_PACKET_SECTIONS = ["identity", "readiness", "verified_evidence"] as const;
export type PortfolioPacketSection = typeof PORTFOLIO_PACKET_SECTIONS[number];

export function normalizePacketSections(value: unknown): PortfolioPacketSection[] {
  if (!Array.isArray(value)) return [...PORTFOLIO_PACKET_SECTIONS];
  return Array.from(new Set(value.filter((section): section is PortfolioPacketSection => PORTFOLIO_PACKET_SECTIONS.includes(section as PortfolioPacketSection))));
}
