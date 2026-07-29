import type {
  InterfaceCertificationDomainId,
  InterfaceDomainResult,
} from "./types";

export function scoreInterfaceCertification(
  domains: Record<
    InterfaceCertificationDomainId,
    InterfaceDomainResult
  >
): number {
  const results = Object.values(domains);
  return Math.round(
    results.reduce((total, result) => total + result.score, 0) /
      results.length
  );
}
