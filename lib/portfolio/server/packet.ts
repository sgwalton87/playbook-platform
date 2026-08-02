import "server-only";

import { loadScholarPortfolioReadiness } from "./readiness";

import type { PortfolioPacketSection } from "@/lib/portfolio/packetContract";
export async function buildServerPortfolioPacket(input: { supabase: LegacyValue; scholarId: string; targetUse: string; sections: PortfolioPacketSection[] }) {
  const readiness = await loadScholarPortfolioReadiness(input.supabase, input.scholarId);
  if (!readiness.ok) return readiness;
  const packet: Record<string, unknown> = { version: 1, targetUse: input.targetUse, generatedAt: new Date().toISOString() };
  if (input.sections.includes("identity")) packet.identity = readiness.portfolio.identity;
  if (input.sections.includes("readiness")) packet.readiness = readiness.completion;
  if (input.sections.includes("verified_evidence")) {
    const { data, error } = await input.supabase.from("evidence").select("title,evidence_type,source,source_type,verified_at,last_observed_at").eq("owner_id", input.scholarId).eq("verification_state", "verified").eq("visibility", "public").is("deleted_at", null).order("verified_at", { ascending: false });
    if (error) return { ok: false as const, error: "Verified public evidence unavailable." };
    packet.verifiedEvidence = data || [];
  }
  return { ok: true as const, packet, scholarName: readiness.portfolio.identity.fullName || "Scholar", readiness: readiness.completion };
}
